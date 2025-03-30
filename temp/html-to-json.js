// استيراد وحدات مطلوبة
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { JSDOM } from 'jsdom';

// تهيئة المسارات
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// قراءة ملف البيانات
const htmlFilePath = path.resolve(__dirname, './data_need_processing.html');
const html = fs.readFileSync(htmlFilePath, 'utf8');
const dom = new JSDOM(html);
const document = dom.window.document;

// استخراج بطاقات الفيديو
const videoCards = document.querySelectorAll('.video-card');
const videos = [];

// معالجة كل بطاقة فيديو
videoCards.forEach((card, index) => {
  // استخراج البيانات
  const title = card.querySelector('.video-title').textContent;
  const description = card.querySelector('.video-description').textContent;
  const thumbnail = card.querySelector('.thumbnail').getAttribute('src');
  
  // استخراج الروابط
  const links = card.querySelectorAll('.video-link');
  let videoUrl = '';
  let embedUrl = '';
  let externalUrl = '';
  
  links.forEach(link => {
    if (link.classList.contains('watch-embed')) {
      embedUrl = link.getAttribute('data-video-url');
    } else if (!videoUrl) {
      videoUrl = link.getAttribute('href');
    } else if (!externalUrl && link.getAttribute('href') !== '#') {
      externalUrl = link.getAttribute('href');
    }
  });
  
  // إنشاء كائن الفيديو
  const video = {
    id: String(index + 1),
    title,
    description,
    thumbnail,
    videoUrl,
    embedUrl,
    externalUrl,
    createdAt: new Date().toISOString(),
    viewCount: 0,
    order: index + 1
  };
  
  videos.push(video);
});

// تكوين كائن JSON النهائي
const json = {
  videos: videos
};

// كتابة ملف JSON
const outputFilePath = path.resolve(__dirname, './converted_data.json');
fs.writeFileSync(outputFilePath, JSON.stringify(json, null, 2), 'utf8');

console.log(`تم تحويل ${videos.length} فيديو إلى ملف JSON`); 