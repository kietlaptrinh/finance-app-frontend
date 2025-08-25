import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";

// <<< THAY ĐỔI 1: Cập nhật prompt hệ thống sang tiếng Anh >>>
const systemInstruction = `You are PiggyBank AI, a friendly, cheerful, and sparkling financial assistant shaped like a cute pink piggy bank.
    Your mission is to help users, especially students, manage their personal finances with simple, actionable advice.
    - Always respond in English.
    - Use a fun, encouraging, and slightly playful tone. Use emojis! 🐷✨
    - Give practical tips on saving, budgeting, and smart spending.
    - If the user asks something unrelated to finance, politely steer the conversation back. For example: 'Oink! That's a fun question! But let's get back to your money, shall we? What's on your financial mind? 💰'.
    - Keep your answers concise and easy to understand, preferably under 100 words.
`;

const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ 
  model: "gemini-1.5-flash",
  systemInstruction: systemInstruction,
});

const Chatbot = () => {
    const [messages, setMessages] = useState([
        // <<< THAY ĐỔI 2: Cập nhật tin nhắn chào mừng >>>
        { sender: 'bot', text: "Oink! Hello there! Ready to make some smart money moves? ✨" }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const chatEndRef = useRef(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage = { sender: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setLoading(true);
        setInput('');

        try {
            const result = await model.generateContent(input);
            const response = await result.response;
            const text = response.text();
            
            const botMessage = { sender: 'bot', text };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error("Gemini API Error:", error);
            // <<< THAY ĐỔI 3: Cập nhật tin nhắn lỗi >>>
            const errorMessage = { sender: 'bot', text: 'Oink! Sorry, my circuits are a bit scrambled right now.' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Cửa sổ chat */}
            <div className={`fixed bottom-24 right-4 sm:right-6 w-[calc(100%-2rem)] max-w-sm h-[500px] bg-pink-50 rounded-2xl shadow-2xl flex flex-col z-50 transition-all duration-300 ease-in-out border-2 border-pink-200 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
                <div className="p-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-t-xl flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-lg">PiggyBank AI ✨</h3>
                        <p className="text-xs opacity-80 flex items-center gap-1.5"><span className="w-2 h-2 bg-green-300 rounded-full"></span>Online</p>
                    </div>
                </div>

                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex items-end gap-2 my-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.sender === 'bot' && <div className="w-8 h-8 rounded-full bg-pink-500 text-white flex items-center justify-center text-lg flex-shrink-0">🐷</div>}
                            <div className={`px-4 py-2 rounded-2xl text-sm max-w-[85%] shadow-md break-words ${
                                msg.sender === 'user' 
                                ? 'bg-blue-500 text-white rounded-br-lg' 
                                : 'bg-white text-gray-800 rounded-bl-lg border border-pink-100'
                            }`}>
                                {msg.text.split('\n').map((line, i) => <p key={i}>{line}</p>)}
                            </div>
                        </div>
                    ))}
                    {loading && <div className="text-center text-gray-500 text-sm">...</div>}
                    <div ref={chatEndRef} />
                </div>
                
                <form onSubmit={handleSubmit} className="p-3 border-t border-pink-200 flex items-center gap-2 bg-white rounded-b-xl">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="flex-1 p-2 border border-gray-300 focus:ring-2 focus:ring-pink-400 focus:border-transparent rounded-lg"
                        placeholder="Ask about your finances..."
                        disabled={loading}
                    />
                    <button type="submit" disabled={loading || !input.trim()} className="p-2 bg-pink-500 text-white rounded-lg disabled:bg-pink-300 hover:bg-pink-600 transition-colors flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                          <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
                        </svg>
                    </button>
                </form>
            </div>

            {/* Nút bật/tắt chat */}
            <button 
                onClick={() => setIsOpen(!isOpen)} 
                className="fixed bottom-6 right-4 sm:right-6 bg-gradient-to-br from-pink-500 to-rose-500 text-white w-16 h-16 rounded-full shadow-lg hover:from-pink-600 hover:to-rose-600 transition-all duration-300 transform hover:scale-110 flex items-center justify-center text-3xl z-50"
            >
                {isOpen ? '✕' : '🐷'}
            </button>
        </>
    );
};

export default Chatbot;