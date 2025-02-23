# Fetching the minified node image on alpine linux
FROM node:slim

# Setting up the work directory
WORKDIR /nodejs-homework-rest-api 

COPY package*.json ./

# Installing dependencies
RUN npm install

# Copying all the files in our project
COPY . .

EXPOSE 3000


# Starting our application
CMD ["npm", "start"] 

# COMENZI DE RULAT IN TERMINAL:

# Build the image, run in terminal:
# docker build -t contacts-app .

# Run the image
# docker run -dp 127.0.0.1:3000:3000 contacts-app