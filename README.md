# Product Review Portal

A full-stack web application built with Node.js, Express, and MongoDB for managing products and user reviews with secure authentication, image URL auto-detection, and automated CI/CD deployment workflows.

---

## Features
- **User Authentication**: Secure registration and login with password hashing (`bcryptjs`) and session management via local storage.
- **Product Management**: Add new products with name, description, and image URLs. Includes an **auto-detect** utility that extracts names and titles from image links.
- **Review System**: Leave 5-star ratings and comments on products.
- **Full CRUD Support**: Secure review ownership verification allowing users to edit (via `PATCH` or `PUT`) or delete their own reviews and products.
- **Automated CI/CD Pipeline**: Integrated GitHub Actions pipeline that checks your code before it goes live to make sure everything works correctly.

---

## Tech Stack
- **Backend**: Node.js, Express.js, Mongoose, MongoDB, bcryptjs, CORS, dotenv
- **Frontend**: HTML5, CSS3, Bootstrap 5, Vanilla JavaScript, FontAwesome
- **DevOps & CI/CD**: GitHub Actions (Automated code checks), Render (Automatic cloud deployment)

---

## CI/CD Pipeline & Deployment Workflow
The project uses **GitHub Actions** to automatically test and deploy your code:
- **What gets checked?** Every time you push changes or open a pull request, GitHub automatically spins up a clean computer, installs Node.js, downloads your project dependencies (`npm install`), and runs a quick health check (`node --check`) to verify there are zero syntax errors or broken imports in your server code.
- **Safe Deployment**: Render is configured to watch your repository—it only publishes the new updates to your live website *after* all these automated checks pass successfully.

---

## Architecture Diagram
<img width="3245" height="6236" alt="diagram (4)" src="https://github.com/user-attachments/assets/1a4bdca6-57f6-4970-a4e7-65bd64a4e4ca" />

---

## Project Structure

```text
productreview/
├── .github/
│   └── workflows/
│       └── ci.yml          # GitHub Actions CI/CD configuration
├── backend/
│   ├── models/
│   │   ├── Product.js
│   │   ├── Review.js
│   │   └── User.js
│   ├── routes/
│   │   ├── products.js
│   │   └── user.js
│   └── server.js
├── frontend/
│   ├── add.html
│   ├── index.html
│   ├── login.html
│   ├── product.html
│   ├── register.html
│   └── script.js
├── .env
├── package-lock.json
└── package.json
