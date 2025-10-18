


# Step 1: Use Ubuntu-based Node image
FROM node:20-bullseye

# Step 2: Set working directory
WORKDIR /app

# Step 3: Copy package.json and package-lock.json
COPY package*.json ./

# Step 4: Install dependencies
RUN npm install

# Step 5: Copy rest of the app
COPY . .

# Step 6: Build Next.js app
RUN npm run build

# Step 7: Expose port 3000
EXPOSE 3000

# Step 8: Start the app
CMD ["npm", "start"]
