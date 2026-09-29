# Product Review Portal

A full-stack web application built with Node.js, Express, and MongoDB for managing products and user reviews with authentication and image URL auto-detection.

---

## Features
- **User Authentication**: Secure registration and login with password hashing (`bcryptjs`) and session management via local storage.
- **Product Management**: Add new products with name, description, and image URLs. Includes an **auto-detect** utility that extracts names and titles from image links.
- **Review System**: Leave 5-star ratings and comments on products.
- **Full CRUD Support**: Secure review ownership verification allowing users to edit (via `PATCH` or `PUT`) or delete their own reviews and products.

---

## Tech Stack
- **Backend**: Node.js, Express.js, Mongoose, MongoDB, bcryptjs, CORS, dotenv
- **Frontend**: HTML5, CSS3, Bootstrap 5, Vanilla JavaScript, FontAwesome

---
## Architecture Diagram**
<img width="3245" height="6236" alt="diagram (4)" src="https://github.com/user-attachments/assets/1a4bdca6-57f6-4970-a4e7-65bd64a4e4ca" />



## Project Structure

```text
productreview/
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
