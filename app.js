// // 'use strict'

const request = require('superagent')
const cheerio = require('cheerio')
const fs = require('fs-extra')
const path = require('path')

let url = 'http://www.mmjpg.com/tag/meitui/'

/**
 * 生成[n, m]随机数
 * @param {number} min 
 * @param {number} max 
 */
function random(min,max){
  let range = max - min
  let rand = Math.random()
  let num = min + Math.round(rand * range)
  return num
}

/**
 * 获取图集的URL
 */
async function getUrl() {
  let linkArr = []
  for (let i = 1; i <= 10; i++) {
    const res = await request.get(url + i)
    const $ = cheerio.load(res.text)
    $('.pic li').each(function (i, elem) {
      let link = $(this).find('a').attr('href')
      linkArr.push(link)
    })
  }
  return linkArr
}

/**
 * 获取图集中的图片
 * @param {string} url 图集URL
 */
async function getPic(url) {
  const res = await request.get(url)
  const $ = cheerio.load(res.text)
  // 以图集名称来分目录  
  const dir = $('.article h2').text()
  console.log(`创建${dir}文件夹`)
  await fs.mkdir(path.join(__dirname, '/mm', dir))
  const pageCount = parseInt($('#page .ch.all').prev().text())
  for (let i = 1; i <= pageCount; i++) {
    let pageUrl = url + '/' + i
    const data = await request.get(pageUrl)
    const _$ = cheerio.load(data.text)
    // 获取图片的真实地址
    const imgUrl = _$('#content img').attr('src')
    download(dir, imgUrl)
    await sleep(random(1000, 5000))        
  }
}

// 下载图片
function download(dir, imgUrl) {
  console.log(`正在下载${imgUrl}`)
  const filename = imgUrl.split('/').pop()  
  const req = request.get(imgUrl)
    .set({ 'Referer': 'http://www.mmjpg.com' })
  req.pipe(fs.createWriteStream(path.join(__dirname, 'mm', dir, filename)))
}


// sleep函数
function sleep(time) {
  return new Promise(function (resolve, reject) {
      setTimeout(function () {
          resolve()
      }, time)
  })
};

async function init(){
  let urls = await getUrl()
  for (let url of urls) {
    await getPic(url)
  }
}

init()