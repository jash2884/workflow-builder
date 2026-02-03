import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation() as any;

  const from = location.state?.from?.pathname || "/";

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await signIn(email);
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign in to your account</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Development-only mock auth</div>
            </div>
            <div>
              <Button type="submit" className="w-full">
                Sign in
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <div className="text-sm text-muted-foreground">Need an account? Just enter any email to sign in.</div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SignIn;
