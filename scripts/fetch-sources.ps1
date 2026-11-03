$ErrorActionPreference = 'Stop'
New-Item -ItemType Directory -Force .data-work | Out-Null
function Fetch($Url, $File) {
  curl.exe -fsSL --retry 2 $Url -o ".data-work/$File"
  if ($LASTEXITCODE -ne 0) { throw "Could not retrieve $Url" }
}
$poetry = 'https://raw.githubusercontent.com/chinese-poetry/chinese-poetry/b8594f81a89752241442f2ce267d6f66f96704ee'
$tang = '%E5%85%A8%E5%94%90%E8%AF%97'
$song = '%E5%AE%8B%E8%AF%8D'
Fetch "$poetry/$tang/%E5%94%90%E8%AF%97%E4%B8%89%E7%99%BE%E9%A6%96.json" 'featured-tang.json'
Fetch "$poetry/$song/%E5%AE%8B%E8%AF%8D%E4%B8%89%E7%99%BE%E9%A6%96.json" 'featured-song.json'
1..9 | ForEach-Object { Fetch "$poetry/$tang/poet.tang.${_}000.json" "tang-$_.json" }
Fetch 'https://raw.githubusercontent.com/zerosoul/chinese-colors/a3e09ddc79c349473768e714d3180a04781a4e39/src/assets/colors.json' 'colors.json'
Fetch 'https://github.com/lxgw/LxgwWenKai/releases/download/v1.530/LXGWWenKai-Regular.ttf' 'LXGWWenKai-Regular.ttf'
$fonts = 'https://raw.githubusercontent.com/google/fonts/2fe1e8c6b137fb13041a7cfca6fdcd8a910ea4dc/ofl'
Fetch "$fonts/mashanzheng/MaShanZheng-Regular.ttf" 'MaShanZheng-Regular.ttf'
Fetch "$fonts/zcoolxiaowei/ZCOOLXiaoWei-Regular.ttf" 'ZCOOLXiaoWei-Regular.ttf'

npm pack @fontsource/noto-serif-tc@5.3.1 --pack-destination .data-work
$kesong = 'https://raw.githubusercontent.com/Miiiller/Xiangcui-Kesong/c49b2946c48a7b27b087800d2190cd7fc43363b8'
$kesongFile = [Uri]::EscapeDataString('香萃刻宋（目前最新版）.ttf')
Fetch "$kesong/$kesongFile" 'XiangcuiKesong.ttf'
Fetch 'https://github.com/TrionesType/zhuque/releases/download/v0.212/ZhuqueFangsong-v0.212.zip' 'zhuque-v0.212.zip'
tar -xf .data-work/zhuque-v0.212.zip -C .data-work ZhuqueFangsong-Regular.ttf
if ($LASTEXITCODE -ne 0) { throw 'Could not extract Zhuque Fangsong' }
Fetch 'https://github.com/lxgw/LxgwZhenKai/releases/download/v0.827/LXGWZhenKaiSlabGB-Regular.ttf' 'LXGWZhenKaiSlabGB-Regular.ttf'
Fetch 'https://github.com/nushu-script/Nyushu/releases/download/NshuF/NyushuFengQi-1.003.ttf' 'NyushuFengQi-1.003.ttf'
