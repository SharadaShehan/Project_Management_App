# Quick Start Guide - Project Management App

Get the entire system deployed to AWS in under 10 minutes!

## 🎯 Prerequisites (5 minutes)

Install these tools if you don't have them:

1. **AWS CLI**: `brew install awscli` (Mac) or `choco install awscli` (Windows)
2. **Terraform**: `brew install terraform` (Mac) or `choco install terraform` (Windows)
3. **Node.js 20+**: `brew install node@20` (Mac) or `choco install nodejs` (Windows)

Configure AWS:
```bash
aws configure
# Enter: Access Key, Secret Key, Region (us-east-1), Format (json)
```

Get Google Gemini API Key:
- Visit: https://makersuite.google.com/app/apikey
- Create new key → Copy it

---

## ⚡ Quick Deploy (5 minutes)

### For macOS/Linux:

```bash
# 1. Navigate to project
cd Project_Management_App

# 2. Configure
cd infrastructure
cp terraform.tfvars.example terraform.tfvars
nano terraform.tfvars  # Edit: gemini_api_key, alert_email
cd ..

# 3. Deploy everything!
chmod +x scripts/*.sh
./scripts/deploy.sh production
```

### For Windows (PowerShell):

```powershell
# 1. Navigate to project
cd Project_Management_App

# 2. Configure
cd infrastructure
Copy-Item terraform.tfvars.example terraform.tfvars
notepad terraform.tfvars  # Edit: gemini_api_key, alert_email
cd ..

# 3. Deploy everything!
.\scripts\deploy.ps1 production
```

**That's it!** The script will:
- ✓ Build Lambda functions
- ✓ Deploy all AWS infrastructure
- ✓ Generate frontend config automatically

---

## 🚀 Run Frontend

After deployment:

```bash
cd frontend
npm install
npm start
```

Open the Expo app on your phone and scan the QR code!

---

## 🧪 Test Deployment

Verify everything works:

```bash
# macOS/Linux
./scripts/test-deployment.sh

# Windows
.\scripts\test-deployment.ps1
```

---

## 📋 What Gets Deployed?

```
AWS Services Created:
├── AppSync GraphQL API (43 resolvers)
├── 43 Lambda Functions
├── DynamoDB Table (single-table design)
├── Cognito User Pool
├── 2 S3 Buckets (private + public)
├── CloudWatch Logs & Alarms
└── IAM Roles & Policies

Total Time: ~5-7 minutes
Estimated Cost: $5-20/month (low traffic)
```

---

## 🔥 Common Commands

```bash
# Deploy to different environment
./scripts/deploy.sh development
./scripts/deploy.sh staging
./scripts/deploy.sh production

# Update after code changes
./scripts/deploy.sh production

# Generate config after manual Terraform changes
./scripts/generate-config.sh

# Test everything
./scripts/test-deployment.sh

# View outputs
cd infrastructure
terraform output

# Destroy everything (⚠️ DELETES ALL DATA!)
./scripts/destroy.sh
```

---

## 🐛 Quick Troubleshooting

**AWS credentials error?**
```bash
aws configure
aws sts get-caller-identity  # Verify
```

**Terraform errors?**
```bash
cd infrastructure
terraform init
terraform validate
```

**Lambda build fails?**
```bash
cd lambda
rm -rf node_modules dist layers
npm install
npm run build
```

**Can't find Terraform outputs?**
```bash
cd infrastructure
terraform refresh
terraform output
```

---

## 📊 Deployment Outputs

After success, you'll see:

```
🎯 Deployment Summary:
   Environment:     production
   AWS Region:      us-east-1
   AppSync URL:     https://xxxxx.appsync-api.us-east-1.amazonaws.com/graphql
   User Pool ID:    us-east-1_XXXXXXXXX
```

These are automatically configured in `frontend/src/aws-config.js`!

---

## 🎓 What's Next?

1. **Create Test User**:
   ```bash
   aws cognito-idp admin-create-user \
     --user-pool-id us-east-1_XXXXXXXXX \
     --username testuser \
     --user-attributes Name=email,Value=test@example.com
   ```

2. **Test GraphQL**: Open AWS Console → AppSync → Queries

3. **Monitor**: CloudWatch Dashboard created automatically

4. **Read Full Guide**: See [DEPLOYMENT.md](DEPLOYMENT.md) for details

---

## 🆘 Need Help?

- **Full Documentation**: [DEPLOYMENT.md](DEPLOYMENT.md)
- **Architecture**: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- **Lambda Functions**: [lambda/README.md](lambda/README.md)
- **Infrastructure**: [infrastructure/README.md](infrastructure/README.md)

---

## 💡 Pro Tips

- **Cost Optimization**: Use `development` environment for testing (destroys easily)
- **Multiple Environments**: Run script with different names for dev/staging/prod
- **Quick Updates**: Script only updates changed resources (fast!)
- **Rollback**: Keep previous Terraform state in S3 (automatic)

---

## 📦 Repository Structure

```
Project_Management_App/
├── scripts/
│   ├── deploy.sh         ← Main deployment script
│   ├── deploy.ps1        ← Windows version
│   ├── generate-config.sh
│   ├── test-deployment.sh
│   └── destroy.sh        ← Cleanup script
├── infrastructure/       ← Terraform configs
├── lambda/              ← 43 Lambda functions
├── frontend/            ← React Native app
└── DEPLOYMENT.md        ← Full documentation
```

---

**Ready? Let's deploy! 🚀**

```bash
./scripts/deploy.sh production
```

---

*Deployment takes ~5-7 minutes. Grab a coffee! ☕*
