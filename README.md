# NestJS

## 简介

NestJS 框架 数据库的 startkit


## feature

- [x] restful api 接口
- [x] jwt 鉴权
- [x] swagger 文档
- [x] 错误统一处理
- [x] RSA 处理敏感接口


## about RSA

```bash
cd pem
# 生成2048位私钥（推荐2048位及以上，安全性更高）
# -out 指定输出文件，-aes256 表示用AES-256加密私钥（需设置密码，可选但强烈建议）
openssl genpkey -algorithm RSA -out private_key.pem -pkeyopt rsa_keygen_bits:2048 -aes256

# 从私钥导出公钥，-pubout 表示输出公钥
openssl rsa -pubout -in private_key.pem -out public_key.pem
```

## script

```bash
npm run build

# 生产环境启动
NODE_ENV=production npm run start:prod
```


## 部署

```bash
lean login --region cn-n1


# 部署
lean deploy -m 'first deploy'
```



```bash
curl -X 'POST' \
  'https://poker-scan.theone.io/api/users/register' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "username": "user222",
  "email": "user222@example.com",
  "password": "password222",
  "rsaData": "WOQG9DsD6eccvr11H26x31p2VWHfzCuGNqgrAkbvZs/79bf0QXb+6F+A/FRl01+vq/rnPLpg+VbJYc1nQqWVWAKsoszOxk1HW4KzF5d7bt0thKTtR74DuxYx0tp5/1hIqutgyC3270ZgS82IlP8wZDV1+iCVCudKTPWIdS4SSObac8pHN6gcjqHQFutVjn8T6eJPFz9yfRLDYSpDDystswiWAzReGgjDYwsAIH5pr+lYqO0wmGtDwiLPEMpoIQasgkeMmDVxjyOMdr/drxXiFL2Lv3TT/H3f/eROgtnFMUXDgByChkueaoERY4gbzDMR4zA0Ur03FEy0vXs7AG4+3g=="
}'
```
