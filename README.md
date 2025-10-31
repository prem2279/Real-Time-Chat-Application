🚀 Real-Time Chat Application

I developed a full-stack chat platform supporting public group chats, private messaging, and real-time presence indicators.

🧩 Tech Stack

    Frontend: React.js
    Backend: Spring Boot, Spring Security
    Database: PostgreSQL(hosted on Neon Cloud)
    Real-time Communication: WebSockets, SockJS, STOMP.js
    Deployment: Docker, AWS EC2

⚙️ Key Features
    
    💬 Real-Time Group Chat: Instant messaging with live typing indicators.
    🔐 Private Messaging: Secure one-on-one chats for personal communication.
    👥 Online Presence: Real-time status updates showing who’s online.
    🗃️ Persistent Storage: PostgreSQL on Neon for storing users, messages, and rooms.
    ⚡ Optimized WebSocket Performance: Achieved ~200ms latency for smooth chat flow.
    🐳 Dockerized Setup: Tested locally with reverse proxy configuration. 
    🌐 Deployed on Amazon EC2

🛠️ Upcoming Integrations
    
    📁 File Transfer: Send images and files between users.
    📴 Offline Messaging: Deliver messages when users come online
    🤖 Chat Model Integration: Integrate an AI-powered chat model (like ChatGPT).

🚀 Impact

Working with these technologies has strengthened my expertise in full-stack development, real-time systems, cloud deployment, and containerization, preparing me to build scalable and responsive applications in production environments.

🌐 Live URL

🔗 Real-Time Chat Application - [http://ec2-18-216-235-121.us-east-2.compute.amazonaws.com](http://ec2-18-216-235-121.us-east-2.compute.amazonaws.com)

Live Demo

[🎬 Watch Demo Video](./demo.mp4)

🧠 Tech Keywords

  React.js Spring Boot Spring Security PostgreSQL Neon Cloud WebSockets SockJS STOMP.js Docker Amazon EC2 Full Stack Development Cloud Deployment Real-Time Apps

⚙️ Setup Instructions

🖥️ 1. Clone the Repository

    git clone https://github.com/prem2279/Real-Time-Chat-Application.git
    cd Real-Time-Chat-Application

🧩 2. Backend Setup (Spring Boot)

    Navigate to the backend folder:
    cd chatapplication-backend
    
    Create a .env file in the backend root directory and add the following keys:
    
    SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/your_database
    SPRING_DATASOURCE_USERNAME=your_username
    SPRING_DATASOURCE_PASSWORD=your_password
    SPRING_SECRET=your_jwt_secret_key
    SPRING_EXPIRATION=86400000
    
    Build and run the backend:
    ./mvnw spring-boot:run

    (or use your IDE like IntelliJ or Eclipse to run the main class)

💻 3. Frontend Setup (React)

    Navigate to the frontend folder:
    cd ../chatapplication-frontend
    
    Install dependencies:
    npm install
    
    Start the React app:
    npm run dev
    
    Open your browser at http://localhost:5173

🐳 4. Run with Docker (Optional)

    To run both frontend and backend via Docker:

docker-compose up --build

🧾 Notes

    Ensure PostgreSQL is running locally or provide a valid Neon Cloud DB URL in .env.

💬 Feedback

    I’m open to suggestions and improvements! Feel free to open issues or share ideas for enhancing this project.
