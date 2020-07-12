# plus1s.live

你的服务器除了用来挂SS外，还可以拿来续

## 使用方法
```
curl 服务器地址:1926
```

例如

```
curl aoaoao.me:1926           # 服务器已被续
curl plus1s.plusnan.me:1926
```

为提升续秒体验，建议使用靠谱的服务器自行搭建。

## 自行搭建

### Go

```
go build stream.go
./stream
```

基于Docker构建：

```
docker build -f Dockerfile-go -t plus1s:live .
docker run -it -p 1926:1926 plus1s:live
```

### Node.js（支持使用浏览器续秒）

```
npm install
node stream.js
```

### Python 

```
# support python2 and python3

python stream.py
```

## 注意事项
注意服务器防火墙放行1926端口。

详细说明：[构建一个在线ASCII视频流服务](https://hfo4.github.io/2018/03/26/e6-9e-84-e5-bb-ba-e4-b8-80-e4-b8-aa-e5-9c-a8-e7-ba-bfascii-e8-a7-86-e9-a2-91-e6-b5-81-e6-9c-8d-e5-8a-a1/)（[防被续存档](https://web.archive.org/web/20200314224703/https://hfo4.github.io/2018/03/26/e6-9e-84-e5-bb-ba-e4-b8-80-e4-b8-aa-e5-9c-a8-e7-ba-bfascii-e8-a7-86-e9-a2-91-e6-b5-81-e6-9c-8d-e5-8a-a1/)）
