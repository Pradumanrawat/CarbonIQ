# CarbonIQ - Carbon Emission Management System

CarbonIQ is an AI-driven sustainability assistant that calculates a user’s carbon footprint based on travel, electricity usage, and renewable energy consumption.
It integrates LangChain agents and structured tools to combine LLM reasoning with backend emission data from custom APIs.
The chatbot can also fetch real-time environmental updates and eco-friendly recommendations using web search integration.


## Features

### For General Users
- **Personal Carbon Footprint Calculator**: Calculate emissions from transportation, electricity usage, and household activities
- **Transportation Analysis**: Track emissions from different vehicle types including EVs, buses, cars, and motorcycles
- **Electricity Usage Tracking**: Monitor and analyze electricity consumption patterns
- **Renewable Energy Integration**: Factor in renewable energy usage and its impact on emissions
- **Personalized Recommendations**: Get tailored advice for reducing your carbon footprint

### For Mine Managers
- **Mine Emission Calculator**: Comprehensive calculation of mining operation emissions
- **Activity-based Tracking**: Monitor diesel consumption, electricity usage, vehicle movement, coal production, and methane release
- **Carbon Sink Management**: Track and calculate carbon sequestration from afforestation, rehabilitation, and soil practices
- **Carbon Credit Calculator**: Determine carbon credits earned or required based on industry baselines
- **Scenario Planning**: Plan and model different emission reduction strategies
- **Sustainability Reporting**: Generate detailed reports on emission status and recommendations

## Technology Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Backend**: Next.js API Routes,Langchain
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT-based authentication
- 

## API Endpoints

### Authentication
- `POST /api/auth/Signup` - User registration
- `POST /api/auth/Signin` - User login

### Emission Calculations
- `POST /api/UserEmssion` - Personal emission calculation
- `POST /api/MineEmission` - Mine emission calculation
- `POST /api/CarbonCredit` - Carbon credit calculation
- `POST /api/ScenarioForm` - Scenario planning

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   Create a `.env.local` file with:
   ```
   JWT_SECRET=your_jwt_secret_here
   MONGODB_URI=your_mongodb_connection_string
   ```

3. **Run the Development Server**
   ```bash
   npm run dev
   ```

4. **Open the Application**
   Navigate to `http://localhost:3000` in your browser

## User Roles

### General User
- Calculate personal carbon footprint
- Get recommendations for emission reduction
- Track household emissions

### Mine Manager
- Calculate mine operation emissions
- Manage carbon credits
- Plan emission reduction scenarios
- Track mine-specific sustainability metrics

## Key Components

- **Authentication System**: Secure login/signup with JWT tokens
- **Dashboard**: Role-based interface with tabbed navigation
- **Forms**: Interactive forms for data input with real-time validation
- **Results Display**: Comprehensive results with visual indicators and recommendations
- **Responsive Design**: Mobile-friendly interface that works on all devices

## Features Highlights

- **Real-time Calculations**: Instant emission calculations with detailed breakdowns
- **Visual Status Indicators**: Color-coded status indicators (Green, Yellow, Red) for easy understanding
- **Comprehensive Recommendations**: Detailed advice for reducing emissions
- **Role-based Access**: Different interfaces for general users and mine managers
- **Persistent Sessions**: Login state maintained across browser sessions
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

## Usage

1. **Sign Up**: Create an account as either a general user or mine manager
2. **Login**: Access your personalized dashboard
3. **Calculate Emissions**: Use the appropriate form based on your role
4. **View Results**: Get detailed calculations and recommendations
5. **Plan Scenarios**: (Mine Managers) Plan emission reduction strategies
6. **Track Progress**: Monitor your sustainability goals over time

## Contributing

This application is designed to help individuals and organizations track and reduce their carbon emissions. The modular architecture makes it easy to extend with additional features and integrations.

## License

This project is part of the CarbonIQ carbon management system.
