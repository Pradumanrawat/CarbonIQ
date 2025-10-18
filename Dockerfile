
# Step 1: Use Node.js base image
FROM node:20-bullseye

# Step 2: Set working directory
WORKDIR /app

# Step 3: Copy package files
COPY package*.json ./

# Step 4: Install dependencies
RUN npm install

# Step 5: Copy the rest of the app
COPY . .

# Step 6: Build Next.js app
RUN npm run build

# Step 7: Expose port
EXPOSE 3000

# Step 8: Start the app
CMD ["npm", "start"]
