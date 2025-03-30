const fs = require('fs');

// بيانات الفيديو من HTML
const videosData = [
  {
    title: "Amilia Onyx Perfect Curves",
    description: "xfreehd.com__Cambro",
    thumbnail: "https://ei.phncdn.com/videos/202002/23/287121112/original/(m=eafTGgaaaa)(mh=xYbEuEG1VyWaICYY)3.jpg?cache=2024121901",
    videoUrl: "https://www.xfreehd.com/video/338462/amilia-onyx-perfect-curves",
    embedUrl: "https://www.xfreehd.com/embed/338462",
    externalUrl: "https://www.cambro.io/992839/naughtynights8-an-amazing-blowjob-fucking-scene-w-the-perfect-amiliaonyx-i-cum-all-over-her-bi-onlyfans-xxx-porn-videos/"
  },
  {
    title: "Stephbunny",
    description: "xhamster.com",
    thumbnail: "https://thumb-nss.xhcdn.com/a/lQxVP6GrfhSWWFzGfFYlNg/012/002/376/v2/2560x1440.208.webp",
    videoUrl: "https://ara.xhamster.com/videos/white-dirty-girl-fucking-black-man-12002376",
    embedUrl: "https://xhamster.com/embed/12002376",
    externalUrl: ""
  },
  {
    title: "Madison Morgan",
    description: "xhamster.com",
    thumbnail: "https://thumb-nss.xhcdn.com/a/sHnbfsZmcOktTMAI-tjfMA/024/416/688/1280x720.17288934.jpg",
    videoUrl: "https://xhamster.com/videos/personal-trainer-gets-to-pound-madisons-pussy-behind-her-bfs-back-making-her-scream-with-pleasure-xheuu2V",
    embedUrl: "https://xhamster.com/embed/xheuu2V",
    externalUrl: ""
  },
  {
    title: "Zara DuRose",
    description: "xhamster.com",
    thumbnail: "https://thumb-nss.xhcdn.com/a/2YZT27YftKEPiiJvYxBzNg/024/730/764/v2/2560x1440.219.webp",
    videoUrl: "https://ara.xhamster.com/videos/tattooed-redhead-zara-durose-takes-cumshot-over-her-tits-xhBNL8C",
    embedUrl: "https://xhamster.com/embed/xhBNL8C",
    externalUrl: ""
  },
  {
    title: "crystal angells",
    description: "eporner.com",
    thumbnail: "https://imggen.eporner.com/11220281/1920/1080/4.jpg",
    videoUrl: "https://www.eporner.com/video-EYuyKwmtmtn/couple-russian/?trx=1227735290aee694b81473a256bea12420712",
    embedUrl: "https://www.eporner.com/embed/EYuyKwmtmtn/",
    externalUrl: ""
  }
];

// تحويل البيانات إلى صيغة JSON المطلوبة
const formattedVideos = videosData.map((video, index) => ({
  id: String(index + 1),
  title: video.title,
  description: video.description,
  thumbnail: video.thumbnail,
  videoUrl: video.videoUrl,
  embedUrl: video.embedUrl,
  externalUrl: video.externalUrl,
  createdAt: new Date().toISOString(),
  viewCount: 0,
  order: index + 1
}));

// إنشاء كائن JSON النهائي
const json = {
  videos: formattedVideos
};

// كتابة ملف JSON
fs.writeFileSync('converted_data.json', JSON.stringify(json, null, 2), 'utf8');

console.log(`تم تحويل ${formattedVideos.length} فيديو إلى ملف JSON`); 