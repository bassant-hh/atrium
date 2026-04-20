export interface ActiveRequest {
  id: string;          
  customerName: string;
  item: string;        
  price: number;
  pickup: string;      
  delivery: string;    
  status?: 'pending' | 'accepted' | 'delivering' | 'completed'; 
}