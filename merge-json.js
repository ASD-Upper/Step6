// الملف: merge-json.js
// وظيفة الملف: دمج ملفي converted_data_complete.json و data.json

import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

// تهيئة المسارات
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// قراءة ملفات البيانات
const completeDataPath = path.join(__dirname, 'converted_data_complete.json');
const existingDataPath = path.join(__dirname, 'data.json');

const completeData = JSON.parse(fs.readFileSync(completeDataPath, 'utf8'));
const existingData = JSON.parse(fs.readFileSync(existingDataPath, 'utf8'));

// إنشاء خريطة للفيديوهات الموجودة في data.json باستخدام عنوان الفيديو والوصف كمفتاح فريد
const existingVideosMap = {};
existingData.videos.forEach(video => {
  const uniqueKey = `${video.title.trim().toLowerCase()}|${video.description.trim().toLowerCase()}`;
  existingVideosMap[uniqueKey] = video;
});

// دمج الفيديوهات من كلا الملفين
const mergedVideos = [];
const processedKeys = new Set();
let nextId = 1;
const usedIds = new Set();

// وضع قائمة بجميع الأرقام المستخدمة كمعرفات
existingData.videos.forEach(video => {
  usedIds.add(video.id);
});

// توليد معرف فريد جديد
function generateUniqueId() {
  while (usedIds.has(String(nextId))) {
    nextId++;
  }
  const newId = String(nextId);
  usedIds.add(newId);
  nextId++;
  return newId;
}

// أولاً، دمج الفيديوهات من converted_data_complete.json
completeData.videos.forEach(video => {
  const uniqueKey = `${video.title.trim().toLowerCase()}|${video.description.trim().toLowerCase()}`;
  const existingVideo = existingVideosMap[uniqueKey];
  
  if (existingVideo) {
    // دمج الخصائص وإعطاء الأولوية للقيم الموجودة في data.json
    mergedVideos.push({...video, ...existingVideo});
  } else {
    // التأكد من أن المعرف فريد
    if (usedIds.has(video.id)) {
      video.id = generateUniqueId();
    } else {
      usedIds.add(video.id);
    }
    mergedVideos.push(video);
  }
  processedKeys.add(uniqueKey);
});

// ثانيًا، إضافة أي فيديوهات من data.json لم تكن موجودة في converted_data_complete.json
existingData.videos.forEach(video => {
  const uniqueKey = `${video.title.trim().toLowerCase()}|${video.description.trim().toLowerCase()}`;
  if (!processedKeys.has(uniqueKey)) {
    mergedVideos.push(video);
    processedKeys.add(uniqueKey);
  }
});

// تحديث الترتيب بناءً على قيمة order الحالية
const sortedVideos = mergedVideos.slice().sort((a, b) => {
  // تحقق من وجود حقل order
  const orderA = typeof a.order === 'number' ? a.order : 999999;
  const orderB = typeof b.order === 'number' ? b.order : 999999;
  return orderA - orderB;
});

// إعادة تعيين قيم order لضمان التسلسل الصحيح
sortedVideos.forEach((video, index) => {
  video.order = index + 1;
});

// إنشاء كائن JSON النهائي
const mergedData = {
  videos: sortedVideos
};

// كتابة الملف المدمج
const outputPath = path.join(__dirname, 'merged_data.json');
fs.writeFileSync(outputPath, JSON.stringify(mergedData, null, 2), 'utf8');

console.log('✅ تم دمج الملفات بنجاح، وتم إنشاء ملف merged_data.json');
console.log(`🎥 عدد الفيديوهات في الملف النهائي: ${sortedVideos.length}`); 