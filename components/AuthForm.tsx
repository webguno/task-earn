import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';

const AuthForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Used to trigger re-animation on toggle
  const [animKey, setAnimKey] = useState(0);

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError(null);
    // Clear form
    setEmail('');
    setPassword('');
    setFullName('');
    setPhone('');
    setAnimKey(prev => prev + 1);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        let authEmail = email;

        // If input doesn't look like an email, assume it's a phone number and lookup the email
        if (!email.includes('@')) {
          const { data, error: profileError } = await supabase
            .from('profiles')
            .select('email')
            .eq('phone', email)
            .single();

          if (profileError || !data) {
            throw new Error('Phone number not found. Please sign up or use email.');
          }
          authEmail = data.email;
        }

        const { error } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password,
        });
        if (error) throw error;
      } else {
        // Sign Up
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              phone: phone
            }
          }
        });

        if (authError) throw authError;

        if (authData.user) {
          // Attempt to save to profiles table immediately
          // Note: This relies on the database having a profiles table with these columns
          // and appropriate RLS policies.
          const { error: profileError } = await supabase.from('profiles').upsert({
            id: authData.user.id,
            email: email,
            full_name: fullName,
            phone: phone,
            role: 'user',
            created_at: new Date().toISOString()
          });
          
          if (profileError) {
             console.warn('Could not save profile details:', profileError.message);
             // We don't block auth success on profile save fail, but it's good to log
          }

          setError("Registration successful! Sign in now.");
          setIsLogin(true);
          setAnimKey(prev => prev + 1);
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col sm:justify-center sm:items-center bg-[#eef2f6] relative overflow-hidden">
        
        {/* Background shapes for desktop elegance */}
        <div className="hidden sm:block absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="hidden sm:block absolute top-[-10%] right-[-10%] w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>

        {/* Mobile: Top Brand Section */}
        <div className="sm:hidden h-[35vh] w-full bg-indigo-600 relative flex flex-col justify-center px-8 z-0">
             {/* Decorative circles */}
             <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white opacity-10"></div>
             <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-40 h-40 rounded-full bg-white opacity-10"></div>
             
             <div className="relative z-10 animate-fade-up">
                <div className="h-14 w-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 shadow-inner">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                </div>
                <h1 className="text-3xl font-black text-white tracking-tight">TaskEarn</h1>
                <p className="text-indigo-100 mt-2 text-sm font-medium">Complete tasks, earn rewards.</p>
             </div>
        </div>

        {/* Card / Bottom Sheet Container */}
        <div className="flex-1 bg-white w-full sm:max-w-md sm:h-auto sm:rounded-3xl sm:shadow-2xl sm:flex-none relative z-10 
                        rounded-t-[2.5rem] mt-[-2rem] sm:mt-0 px-8 pt-10 pb-8 sm:p-10 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
            
            {/* Desktop Header */}
            <div className="hidden sm:block text-center mb-8 animate-fade-up">
                 <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-indigo-50 text-indigo-600 mb-4 shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
                <p className="text-sm text-gray-500 mt-1">Please enter your details.</p>
            </div>

            {/* Form Content - Re-animates on toggle */}
            <div key={animKey} className="animate-slide-in">
                <div className="mb-6 sm:hidden">
                    <h2 className="text-2xl font-bold text-gray-900">{isLogin ? 'Welcome Back!' : 'Create Account'}</h2>
                    <p className="text-gray-400 text-sm mt-1">
                        {isLogin ? 'Sign in to continue' : 'Join us to start earning'}
                    </p>
                </div>

                <form className="space-y-4" onSubmit={handleAuth}>
                    
                    {!isLogin && (
                        <>
                            <div className="space-y-1">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="block w-full pl-11 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-0 transition-all font-medium"
                                        placeholder="Full Name"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                    </div>
                                    <input
                                        type="tel"
                                        required
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="block w-full pl-11 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-0 transition-all font-medium"
                                        placeholder="Phone Number"
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    <div className="space-y-1">
                         <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                </svg>
                            </div>
                            <input
                                type={isLogin ? "text" : "email"}
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="block w-full pl-11 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-0 transition-all font-medium"
                                placeholder={isLogin ? "Email or Phone Number" : "Email Address"}
                            />
                         </div>
                    </div>
                    
                    <div className="space-y-1">
                         <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full pl-11 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-0 transition-all font-medium"
                                placeholder="Password"
                            />
                         </div>
                         {isLogin && (
                            <div className="flex justify-end pt-1">
                                <button type="button" className="text-xs font-bold text-indigo-600 hover:text-indigo-800">Forgot Password?</button>
                            </div>
                         )}
                    </div>

                    {error && (
                        <div className="animate-pop text-red-500 text-sm text-center bg-red-50 p-3 rounded-xl border border-red-100 flex items-center justify-center gap-2">
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                             {error}
                        </div>
                    )}

                    <div className="pt-2">
                        <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-2xl text-base font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-lg shadow-indigo-200 active:scale-[0.98] transition-all"
                        >
                        {loading ? (
                             <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                             </svg>
                        ) : (
                            isLogin ? 'Sign In' : 'Create Account'
                        )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Footer Toggle */}
            <div className="mt-8 text-center delay-100 animate-fade-up">
                <p className="text-sm text-gray-500">
                    {isLogin ? "New to TaskEarn? " : "Already have an account? "}
                    <button 
                        type="button"
                        onClick={toggleMode}
                        className="font-bold text-indigo-600 hover:text-indigo-800 ml-1 py-2"
                    >
                        {isLogin ? "Create Account" : "Sign In"}
                    </button>
                </p>
            </div>
        </div>
    </div>
  );
};

export default AuthForm;