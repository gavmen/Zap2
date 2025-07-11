# Deployment Guide

## 🚀 Production Deployment Options

### Option 1: Simple VPS Deployment

#### Prerequisites:
- Ubuntu/Debian VPS with Go 1.18+
- Domain name (optional but recommended)
- SSL certificate (Let's Encrypt recommended)

#### Steps:

1. **Upload code to server:**
```bash
scp -r ./Zap2 user@your-server:/opt/
```

2. **Install dependencies:**
```bash
cd /opt/Zap2/chat-app
go mod tidy
```

3. **Create systemd service:**
```bash
sudo nano /etc/systemd/system/secure-chat.service
```

```ini
[Unit]
Description=Secure Chat Application
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/Zap2/chat-app
ExecStart=/usr/local/go/bin/go run main.go
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

4. **Start and enable service:**
```bash
sudo systemctl daemon-reload
sudo systemctl enable secure-chat
sudo systemctl start secure-chat
```

5. **Setup reverse proxy (Nginx):**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

6. **Setup SSL with Let's Encrypt:**
```bash
sudo certbot --nginx -d your-domain.com
```

### Option 2: Docker Deployment

#### Dockerfile:
```dockerfile
FROM golang:1.19-alpine AS builder

WORKDIR /app
COPY chat-app/go.mod chat-app/go.sum ./
RUN go mod download

COPY chat-app/ ./
RUN go build -o main .

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/

COPY --from=builder /app/main .
COPY --from=builder /app/static ./static

EXPOSE 8080
CMD ["./main"]
```

#### Docker Compose:
```yaml
version: '3.8'
services:
  chat-app:
    build: .
    ports:
      - "8080:8080"
    environment:
      - PORT=8080
    restart: unless-stopped
    
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: chat_app
      MYSQL_USER: gabriel
      MYSQL_PASSWORD: password
    volumes:
      - mysql_data:/var/lib/mysql
    restart: unless-stopped

volumes:
  mysql_data:
```

### Option 3: Cloud Platform Deployment

#### Heroku:
1. Create `Procfile`:
```
web: cd chat-app && go run main.go
```

2. Deploy:
```bash
heroku create your-app-name
git push heroku main
```

#### Google Cloud Run:
```bash
gcloud run deploy secure-chat \
  --source ./chat-app \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

#### AWS EC2:
Similar to VPS deployment but using AWS security groups and load balancers.

## 🔧 Production Configuration

### Environment Variables:
```bash
# Server configuration
export PORT=8080
export HOST=0.0.0.0

# Database (if enabled)
export DB_DSN="user:password@tcp(db-host:3306)/chat_app"
export DB_ENABLED=true

# Security
export CORS_ORIGIN="https://your-domain.com"
export MAX_MESSAGE_SIZE=4096
```

### Security Hardening:

1. **Firewall Configuration:**
```bash
# Allow only necessary ports
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

2. **Rate Limiting (Nginx):**
```nginx
http {
    limit_req_zone $binary_remote_addr zone=chat:10m rate=10r/s;
    
    server {
        location /ws {
            limit_req zone=chat burst=20 nodelay;
            # ... rest of config
        }
    }
}
```

3. **SSL Configuration:**
```nginx
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
ssl_prefer_server_ciphers off;
add_header Strict-Transport-Security "max-age=63072000" always;
```

## 📊 Monitoring and Logging

### Logging Setup:
```go
// Add to main.go for structured logging
import "log/slog"

logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
```

### Health Check Endpoint:
```go
http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
    w.WriteHeader(http.StatusOK)
    w.Write([]byte("OK"))
})
```

### Metrics Collection:
Consider integrating:
- Prometheus for metrics
- Grafana for visualization
- ELK stack for log analysis

## 🔒 Security Considerations

### Before Production:

1. **Enable HTTPS everywhere**
2. **Set up proper CORS policies**
3. **Implement rate limiting**
4. **Add user authentication**
5. **Set up monitoring and alerting**
6. **Regular security updates**
7. **Database security (if enabled)**
8. **Input validation and sanitization**

### Security Headers:
```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self' ws: wss:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';" always;
```

## 🚦 Load Testing

### Simple Load Test:
```bash
# Install hey: go install github.com/rakyll/hey@latest
hey -n 1000 -c 10 http://your-domain.com
```

### WebSocket Load Test:
Use tools like:
- Artillery.io
- WebSocket King
- Custom Node.js scripts

## 📈 Scaling Considerations

### Horizontal Scaling:
- Use Redis for session management
- Implement proper load balancing
- Consider message queuing (Redis/RabbitMQ)

### Vertical Scaling:
- Monitor CPU and memory usage
- Optimize Go garbage collection
- Database optimization (if used)

### CDN Integration:
- Serve static files via CDN
- Reduce server load
- Improve global performance

## 🆘 Backup and Recovery

### Database Backup:
```bash
# MySQL backup
mysqldump -u user -p chat_app > backup.sql

# Automated backup
0 2 * * * /usr/bin/mysqldump -u user -p'password' chat_app > /backups/chat_app_$(date +\%Y\%m\%d).sql
```

### Application Backup:
```bash
# Code backup
tar -czf app-backup-$(date +%Y%m%d).tar.gz /opt/Zap2/

# Configuration backup
cp /etc/systemd/system/secure-chat.service /backups/
cp /etc/nginx/sites-available/secure-chat /backups/
```
