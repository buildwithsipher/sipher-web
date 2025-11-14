"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const supabase = createClient();
  const router = useRouter();

  async function handleGoogleLogin() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/waitlist/complete`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error("Google login error:", error.message);
        alert("Login failed. Please try again.");
      } else if (data?.url) {
        // Redirect to Google OAuth
        window.location.href = data.url
      }
    } catch (err) {
      console.error("Unexpected login error:", err);
    }
  }

  useEffect(() => {
    async function checkSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user?.email) {
        // Check if user is in waitlist
        const { data: waitlistUser } = await supabase
          .from('waitlist_users')
          .select('id')
          .eq('email', session.user.email)
          .single();

        if (waitlistUser) {
          // User already in waitlist → redirect to dashboard
          router.push("/waitlist/dashboard");
        } else {
          // User not in waitlist → redirect to complete onboarding
          router.push("/waitlist/complete");
        }
      }
    }

    checkSession();
  }, [supabase, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
      <h1 className="text-5xl font-bold mb-6">
        Welcome to Sipher<span className="text-purple-400">*</span>
      </h1>
      <p className="text-gray-400 mb-10 max-w-md text-center">
        Sign in to access your Founder Dashboard and start building your ProofCard.
      </p>

      <button
        onClick={handleGoogleLogin}
        className="bg-purple-500 hover:bg-purple-600 px-6 py-3 rounded-lg font-semibold transition"
      >
        Continue with Google
      </button>

      <p className="mt-6 text-sm text-gray-500">
        By signing in, you agree to our{" "}
        <a href="/terms" className="underline text-purple-400">
          Terms
        </a>{" "}
        and{" "}
        <a href="/privacy" className="underline text-purple-400">
          Privacy Policy
        </a>
        .
      </p>
    </div>
  );
}