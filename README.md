# SOVAP CyberLabs 

A Vulnerable Web Application designed for cybersecurity training. Incorporates "Cyberpunk" aesthetics and 6 interactive labs.

## 🚀 Quick Start (Local Node.js)
1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Run Server**:
   ```bash
   node server.js
   ```
3. **Access**: Open `http://localhost:3000`

---

## 🐳 Running with Docker (Recommended)
This method ensures all environment variables for the labs are correctly set.

1. **Build and Run**:
   ```bash
   docker-compose up --build -d
   ```
2. **Access**: Open `http://localhost:3000`
3. **Stop**:
   ```bash
   docker-compose down
   ```

## 🛡️ Labs
1. **Broken Access Control**: IDOR vulnerability in profile viewer.
2. **Cryptographic Failures**: Weak XOR encryption.
3. **SQL Injection**: Login bypass via SQLi.
4. **Insecure Design**: Business logic flaw in coupon system.
5. **Security Misconfiguration**: Verbose error messages leaking secrets.
6. **Vulnerable Components**: RCE via `eval()`.

## 🤝 Sharing
- **Source**: Push to GitHub/GitLab.
- **Docker**: Push to Docker Hub (`docker push user/sovap-labs`).
- **Demo**: Use `ngrok http 3000` for a quick public link.

