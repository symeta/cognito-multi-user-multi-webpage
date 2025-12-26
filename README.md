# cognito-multi-user-multi-webpage

This demo showcases how to set up a multi-user, multi-webpage authorization mechanism leveraging on Amazon Cognito.

# 认证与图片访问流程

<img width="672" height="1022" alt="Screenshot 2025-12-26 at 11 29 01" src="https://github.com/user-attachments/assets/2869a84f-b5ed-495a-9889-a8c67d2a0137" />

# 安全机制                                                                            
  • 预签名 URL 1小时后过期                                                                 
  • 每次登录生成新的签名 URL                                                               
  • S3 桶非公开，无签名无法访问                                                            
  • 必须通过 Cognito 认证才能获取预签名 URL 
  
