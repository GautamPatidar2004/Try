import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useGiveaway, type GiveawayEntry } from '@/hooks/useGiveaway';
import { Instagram, CheckCircle2 } from 'lucide-react';
import { triggerSuccessConfetti } from '@/utils/lazyConfetti';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  instagram_username: z.string().optional(),
  age_verified: z.boolean().refine((val) => val === true, {
    message: 'You must be 18 or older to enter',
  }),
  us_resident: z.boolean().refine((val) => val === true, {
    message: 'Must be a US resident to enter',
  }),
  shared_to_story: z.boolean().optional(),
  terms_agreed: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the terms',
  }),
});

type FormValues = z.infer<typeof formSchema>;

export const EntryForm = () => {
  const { addEntry, isSubmitting } = useGiveaway();
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      instagram_username: '',
      age_verified: false,
      us_resident: false,
      shared_to_story: false,
      terms_agreed: false,
    },
  });

  const onSubmit = async (data: FormValues) => {
    const entry: GiveawayEntry = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      instagram_username: data.instagram_username,
      age_verified: data.age_verified,
      us_resident: data.us_resident,
      shared_to_story: data.shared_to_story,
      terms_agreed: data.terms_agreed,
    };
    
    const result = await addEntry(entry);
    
    if (result.success) {
      setIsSuccess(true);
      form.reset();
      
      // Trigger confetti
      await triggerSuccessConfetti();
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center space-y-6 p-8 bg-primary/5 rounded-2xl border border-primary/20">
        <CheckCircle2 className="h-16 w-16 text-primary mx-auto animate-bounce" />
        <div className="space-y-2">
          <h3 className="text-2xl font-bold">You're In! 🎉</h3>
          <p className="text-muted-foreground">
            Your entry has been confirmed. Good luck!
          </p>
        </div>
        <div className="bg-card rounded-xl p-6 space-y-4">
          <h4 className="font-semibold">Increase Your Chances:</h4>
          <div className="space-y-3 text-left">
            <div className="flex items-start gap-3">
              <Instagram className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">1. Follow @Hostfluencer</p>
                <p className="text-sm text-muted-foreground">Get updates and exclusive content</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Instagram className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">2. Like our giveaway post</p>
                <p className="text-sm text-muted-foreground">Show some love!</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Instagram className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">3. Tag 2 friends in comments</p>
                <p className="text-sm text-muted-foreground">Share the opportunity</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Instagram className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">4. Share to your story & tag us</p>
                <p className="text-sm text-muted-foreground">Bonus entry!</p>
              </div>
            </div>
          </div>
        </div>
        <Button onClick={() => setIsSuccess(false)} variant="outline">
          Enter Another Email
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl md:text-3xl font-bold">Enter to Win</h2>
        <p className="text-muted-foreground">
          Fill out the form below for your bonus website entry
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-card border rounded-2xl p-6 md:p-8">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name *</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email *</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="john@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone (Optional)</FormLabel>
                <FormControl>
                  <Input type="tel" placeholder="(555) 123-4567" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="instagram_username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Instagram Username (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="@yourusername" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4 pt-4 border-t">
            <FormField
              control={form.control}
              name="age_verified"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      I am 18 years of age or older *
                    </FormLabel>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="us_resident"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      I am a US resident *
                    </FormLabel>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="shared_to_story"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      I shared this to my Instagram story & tagged @Hostfluencer (Bonus Entry!)
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="terms_agreed"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      I agree to the{' '}
                      <a href="/raffle-rules" className="text-primary hover:underline" target="_blank">
                        terms and conditions
                      </a>{' '}
                      *
                    </FormLabel>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Entry'}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            This giveaway is not sponsored, endorsed, or administered by Instagram.
          </p>
        </form>
      </Form>
    </div>
  );
};
