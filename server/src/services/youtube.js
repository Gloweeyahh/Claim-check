const API_KEY = process.env.YOUTUBE_API_KEY;

function extractVideoId(parsedUrl) {
  if (parsedUrl.hostname.includes('youtu.be')) {
    return parsedUrl.pathname.slice(1);
  }
  return parsedUrl.searchParams.get('v');
}

export async function fetchYouTubeContent(parsedUrl) {
  if (!API_KEY) {
    return { available: false, reason: 'missing-youtube-key' };
  }

  const videoId = extractVideoId(parsedUrl);
  if (!videoId) {
    return { available: false, reason: 'invalid-youtube-url' };
  }

  const videoRes = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${API_KEY}`
  );
  const videoData = await videoRes.json();
  const video = videoData.items && videoData.items[0];
  if (!video) {
    return { available: false, reason: 'video-not-found' };
  }

  const { title, description } = video.snippet;

  // Top comments are optional — a lot of videos have comments disabled,
  // and that shouldn't fail the whole request.
  let topComment = '';
  try {
    const commentsRes = await fetch(
      `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&maxResults=3&order=relevance&key=${API_KEY}`
    );
    const commentsData = await commentsRes.json();
    const first = commentsData.items && commentsData.items[0];
    if (first) {
      topComment = first.snippet.topLevelComment.snippet.textDisplay;
    }
  } catch (err) {
    // ignore — comments are a bonus signal, not required
  }

  return {
    available: true,
    claim: title,
    sourceType: 'youtube',
    sourceDetail: 'youtube.com',
    raw: { title, description, topComment },
  };
}
