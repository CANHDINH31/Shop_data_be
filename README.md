# Deploy Application to Ubuntu using PM2, Nginx.

## Steps to Deploy

### 1. Install NodeJS and npm

```bash
sudo apt update
sudo apt install nodejs NPM -y
node -v
npm -v
```

### 2. Install Nginx

```bash
sudo apt install nginx
sudo systemctl stauts nginx
sudo systemctl start nginx
sudo systemctl enable nginx
sudo ufw allow 'Nginx Full'
sudo ufw reload
```

### 3. Install PM2

```bash
sudo npm install -g pm2
pm2 -v
```

### 4. Install Docker and docker-compose

```bash
sudo apt install apt-transport-https ca-certificates curl software-properties-common -y
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt install docker-ce docker-ce-cli containerd.io -y
sudo systemctl start docker
sudo systemctl enable docker

sudo curl -L "https://github.com/docker/compose/releases/download/v2.22.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
docker-compose --version
```

### 5. Clone the repository and setup env

```bash
cd /var/www/html
git clone https://github.com/your-username/your-repo.git
coppy .env.example to .env
npm install -f
npm run build
```

### 6. Start the application with PM2

#### FE

```bash
pm2 start npm --name shop_data_fe -- run dev
pm2 startup systemd
pm2 save
```

#### BE

```bash
cd shop_data_be
docker-compose up -d
pm2 start dist/main.js --name shop_data_be
pm2 startup systemd
pm2 save
```

#### Restart and update code

```bash
git pull
pm2 restart <name>
pm2 save
```

#### Check status

```bash
pm2 status
```

### 7. Configuration

#### FE

```bash
cd /etc/nginx/sites-available
nano frontend
```

##### Add the following configuration

```bash
server {
    listen 80;
    server_name vpncn2.top;
    root /var/www/html/shop_data/dist;
    index index.html index.htm;
    add_header ‘Access-Control-Allow-Origin’ ‘*’;


    location / {
        try_files $uri $uri/ /index.html?$query_string;
        proxy_read_timeout 900;
    }
    location ~ /\.ht {
        deny all;
    }
    location ~* \.css$ {
        expires 30d;
    }
    location ~* \.js$ {
        expires 30d;
    }
    location ~* \.(jpg|jpeg|png|gif|ico)$ {
        expires 30d;
    }

}
```

```bash
sudo ln -s /etc/nginx/sites-available/frontend /etc/nginx/sites-enabled
sudo systemctl restart nginx
```

#### BE

```bash
cd /etc/nginx/sites-available
nano backend
```

##### Add the following configuration

```bash
server {
    listen 8888;
    server_name _;
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/backend /etc/nginx/sites-enabled
sudo systemctl restart nginx
```
