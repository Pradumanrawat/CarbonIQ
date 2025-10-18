
# Step 1: Use Ubuntu-based Node image
FROM node:20-bullseye

# Step 2: Set working directory
WORKDIR /app

# Step 3: Copy package files
COPY package*.json ./

# Step 4: Install dependencies
RUN npm install

# Step 5: Copy rest of the app
COPY . .

# Step 6: Build-time args
ARG GOOGLE_API_KEY
ARG JWT_SECRET
ARG NEXT_PUBLIC_BASE_URL
ARG TAVILY_API_KEY
ARG MONGO_URI

# Step 7: Set environment variables for build
ENV GOOGLE_API_KEY=$GOOGLE_API_KEY
ENV JWT_SECRET=$JWT_SECRET
ENV NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL
ENV TAVILY_API_KEY=$TAVILY_API_KEY
ENV MONGO_URI=$MONGO_URI

# Step 8: Build Next.js app
RUN npm run build

# Step 9: Expose port 3000
EXPOSE 3000

# Step 10: Start the app
CMD ["npm", "start"]
