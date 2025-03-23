// src/socket.js
import { io } from 'socket.io-client';

const socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'); // Or backend URL

export default socket;
