import React, { useState } from "react";

const LoginScreen = ({ handleGoogleLogin, handleEmailLogin }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    return (
        <div className="h-screen flex items-center justify-center bg-default/20 rounded-md">
            <div className="w-[80rem] max-w-md p-5 shadow-md rounded-2xl bg-white flex flex-col">
                <h1 className="text-2xl font-bold text-center p-3">Login</h1>
                <div className="flex flex-col gap-2 space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            placeholder="Digite seu email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 w-full p-2 rounded-md bg-default/20"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Senha
                        </label>
                        <input
                            id="password"
                            type="password"
                            placeholder="Digite sua senha"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 w-full bg-default/20 p-2 rounded-md"
                        />
                    </div>

                    <button
                        onClick={() => handleEmailLogin(email, password)}
                        className="w-full p-2 bg-default text-white py-2 rounded-md"
                    >
                        Entrar
                    </button>

                    <button
                        onClick={handleGoogleLogin}
                        className="w-full p-2 bg-default text-white py-2 rounded-md"
                    >
                        Entrar com Google
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginScreen;
