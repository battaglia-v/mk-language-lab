"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface ErrorDetails {
  message: string;
  digest?: string;
  stack?: string;
}

interface SupportFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  errorDetails?: ErrorDetails;
}

interface FormData {
  name: string;
  email: string;
  subject: string;
  description: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  description?: string;
}

export default function SupportForm({ open, onOpenChange, errorDetails }: SupportFormProps) {
  const t = useTranslations("support");
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    subject: errorDetails ? "Error Report" : "",
    description: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [showErrorDetails, setShowErrorDetails] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = t("required");
    }

    if (!formData.email.trim()) {
      newErrors.email = t("required");
    } else if (!validateEmail(formData.email)) {
      newErrors.email = t("invalidEmail");
    }

    if (!formData.subject.trim()) {
      newErrors.subject = t("required");
    }

    if (!formData.description.trim()) {
      newErrors.description = t("required");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const response = await fetch("/api/support", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          errorDetails: errorDetails ? {
            message: errorDetails.message,
            digest: errorDetails.digest,
            stack: errorDetails.stack,
          } : undefined,
        }),
      });

      if (response.ok) {
        setSubmitStatus("success");
        // Reset form after 2 seconds and close modal
        setTimeout(() => {
          setFormData({
            name: "",
            email: "",
            subject: "",
            description: "",
          });
          setSubmitStatus("idle");
          onOpenChange(false);
        }, 2000);
      } else {
        const data = await response.json();
        console.error("Support request failed:", data);
        setSubmitStatus("error");
      }
    } catch (error) {
      console.error("Error submitting support request:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("subtitle")}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name">{t("name")}</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder={t("name")}
              aria-invalid={!!errors.name}
              disabled={isSubmitting || submitStatus === "success"}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name}</p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email">{t("email")}</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder={t("email")}
              aria-invalid={!!errors.email}
              disabled={isSubmitting || submitStatus === "success"}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email}</p>
            )}
          </div>

          {/* Subject Field */}
          <div className="space-y-2">
            <Label htmlFor="subject">{t("subject")}</Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => handleChange("subject", e.target.value)}
              placeholder={t("subject")}
              aria-invalid={!!errors.subject}
              disabled={isSubmitting || submitStatus === "success"}
            />
            {errors.subject && (
              <p className="text-xs text-destructive">{errors.subject}</p>
            )}
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <Label htmlFor="description">{t("description")}</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder={t("description")}
              rows={5}
              aria-invalid={!!errors.description}
              disabled={isSubmitting || submitStatus === "success"}
            />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description}</p>
            )}
          </div>

          {/* Error Details (Collapsible) */}
          {errorDetails && (
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setShowErrorDetails(!showErrorDetails)}
                className="flex w-full items-center justify-between rounded-md border border-border bg-muted p-3 text-left text-sm font-medium hover:bg-muted/80"
              >
                <span>{t("errorDetails")}</span>
                <span className="text-muted-foreground">
                  {showErrorDetails ? "−" : "+"}
                </span>
              </button>
              {showErrorDetails && (
                <div className="rounded-md border border-border bg-muted p-4">
                  <div className="space-y-2 text-xs font-mono">
                    <div>
                      <strong>Message:</strong>
                      <pre className="mt-1 whitespace-pre-wrap break-words">
                        {errorDetails.message}
                      </pre>
                    </div>
                    {errorDetails.digest && (
                      <div>
                        <strong>Error ID:</strong>
                        <pre className="mt-1 whitespace-pre-wrap break-words">
                          {errorDetails.digest}
                        </pre>
                      </div>
                    )}
                    {errorDetails.stack && (
                      <div>
                        <strong>Stack:</strong>
                        <pre className="mt-1 max-h-40 overflow-auto whitespace-pre-wrap break-words">
                          {errorDetails.stack}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Success Message */}
          {submitStatus === "success" && (
            <div className="rounded-md bg-green-500/10 border border-green-500/20 p-3 text-sm text-green-600 dark:text-green-400">
              {t("success")}
            </div>
          )}

          {/* Error Message */}
          {submitStatus === "error" && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
              {t("error")}
            </div>
          )}

          {/* Form Actions */}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting || submitStatus === "success"}
            >
              {t("cancel")}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || submitStatus === "success"}
            >
              {isSubmitting ? t("sending") : t("submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
