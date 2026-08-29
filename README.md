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
<img width="1641" height="1021" alt="image" src="https://github.com/user-attachments/assets/49ba8194-e93c-4269-9af5-6a40e798f1fd" />


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
