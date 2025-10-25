import axios from "axios"


const API_URL='http://localhost:8080';

const api = axios.create({
    baseURL:API_URL,
    headers:{
        'Content-Type': 'application/json'
    },
    withCredentials: true
});

// Response Interceptor for Global error handling
api.interceptors.response.use(
    (response)=> response,
    (error)=>{
        //Global Error Handling
        if(error.response){
            switch (error.response.status){
                case 401: //Unauthorized
                    authService.logout();
                    window.location.href='/login';
                    break;

                case 403: //Access Forbidden
                    console.error("Access Forbidden");
                    break;
                case 404: //Resource not found
                    console.error("Resource Not Found");
                    break;
                case 500: // Internal server error
                    console.error("Internal Server error");
                    break;
            }
        }
        else if(error.request){
            console.error("Request made but didn't get the response ",error.request);
        }
        else{
            console.error("Something happend in the request "+error.message);
        }

        return Promise.reject(error);
    }
);

const generateUserColor = ()=>{
    const colors = [
        '#FFFFFF', // White
        '#000000', // Black
        '#FF0000', // Red
        '#00FF00', // Green
        '#0000FF', // Blue
        '#FFFF00', // Yellow
        '#00FFFF', // Cyan / Aqua
        '#FF00FF', // Magenta / Fuchsia
        '#808080', // Gray
        '#C0C0C0'  // Silver
    ];

    return colors[Math.floor(Math.random()*colors.length)];


}

export const authService={

    login: async (username,password)=>{
        try{
            const response = await api.post('/auth/login',{
                username,
                password
            });

            // After successful login
            const userColor =generateUserColor();
            const userData = {
                ...response.data,
                color: userColor,
                loginTime: new Date().toISOString()
            };

            localStorage.setItem('curerntUser',JSON.stringify(userData));
            localStorage.setItem('user',JSON.stringify(response.data));

            return{
                success:true,
                user:userData
            }

        }catch (error){

            console.error("Login Failed", error);
            const errorMsg = error.response?.data?.message || 'Login failed, Please check your credentials';
            throw new errorMsg;

        }
    },

    signup: async (username,password,email)=>{

        try{

            const response = await api.post('/auth/signup',{
                username,
                password,
                email
            });

            return{
                success:true,
                user:response.data
            };



        }catch(error){
            console.error('Signup Failed', error);
            const errorMsg = error.response?.data?.message || 'Signup failed, Please try again';
            throw new errorMsg;
        }
    },

    logout: async()=>{
        try{
            await api.post('/auth/logout');
        }catch(error){
            console.error('Logout Failed', error);
        }
        finally {
            localStorage.removeItem('currentUser');
            localStorage.removeItem('user');
        }
    },

    fetchCurrentUser: async ()=>{
        try{
            const response = await api.get('/auth/getCurrentUser');

            localStorage.setItem('user',JSON.stringify(response.data));
            return response.data;

        }
        catch(error){
            console.error('Failed to Fetch User Data', error);

            //if unauthorized, then the user needs to log out
            if(error.response && error.response.status === 401){
                await authService.logout();
            }

        }
    },

    getCurrentUser: ()=>{
        const currentUserStr = localStorage.getItem('currentUser');
        const userStr = localStorage.getItem('user');

        try{
            if(currentUserStr){
                return JSON.parse(currentUserStr);
            }else if(userStr){
                const userData = JSON.parse(userStr);
                const userColor = generateUserColor();

                return {
                    ...userData,
                    color: userColor
                }
            }
            return null;
        }catch(error){
            console.error('Unable to Parse user data',error);
            return null;
        }


    },

    isAuthenticated:()=>{
        const user = localStorage.getItem('user')||localStorage.getItem('currentUser');
        return !!user;
    },

    fetchPrivateMessages: async (user1,user2)=>{
        try{
            const response = await api.get(`/api/messages/private?user1=${encodeURIComponent(user1)}&user2=${encodeURIComponent(user2)}`);
            return response.data;
        }catch(error){
            console.error('Unable to fetch private messages', error);
            throw error;
        }
    },

    getOnlineUsers : async()=>{
        try{
            const response = await api.get(`/auth/getonlineusers`);
            return response.data;
        }catch(error){
            console.error('Unable to get online Users',error);
            throw error;
        }
    }




}


