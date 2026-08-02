export interface Rider {
    id?: string;
    fullName:string;
    firstName?: string;
    lastName?: string;
    email?: string;
   password?:string;
     username?:string;
    university: string;


    
    phone: string;
    hasBicycle: boolean; 
    status: 'pending' | 'active' | 'inactive';
    role: "ADMIN" | "CLIENT" | "DELIVERY";
}

export interface AuthResponse {
    token: string;
    rider: Rider;
}