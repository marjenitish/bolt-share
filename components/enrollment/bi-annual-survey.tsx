import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';

const formSchema = z.object({
  physicalActivity: z.enum(['daily', 'weekly', 'monthly', 'rarely']),
  healthGoals: z.string().min(1, 'Please share your health goals'),
  exerciseBarriers: z.string().min(1, 'Please describe any barriers to exercise'),
  preferredActivities: z.string().min(1, 'Please list your preferred activities'),
  healthConcerns: z.string().optional(),
});

interface BiAnnualSurveyProps {
  onSubmit: () => void;
}

export function BiAnnualSurvey({ onSubmit }: BiAnnualSurveyProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    // Handle form submission
    console.log(data);
    onSubmit();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Bi-Annual Survey</h2>
        <p className="text-muted-foreground">
          Help us understand your fitness goals and preferences to provide you with the best possible experience.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <Card className="p-6">
            <FormField
              control={form.control}
              name="physicalActivity"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>How often do you currently engage in physical activity?</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="space-y-2"
                    >
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="daily" />
                        </FormControl>
                        <FormLabel className="font-normal">Daily</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="weekly" />
                        </FormControl>
                        <FormLabel className="font-normal">2-3 times per week</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="monthly" />
                        </FormControl>
                        <FormLabel className="font-normal">A few times per month</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="rarely" />
                        </FormControl>
                        <FormLabel className="font-normal">Rarely or never</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4 mt-6">
              <FormField
                control={form.control}
                name="healthGoals"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>What are your main health and fitness goals?</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Improve strength, increase flexibility, enhance balance..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="exerciseBarriers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>What barriers have prevented you from exercising regularly?</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Time constraints, physical limitations, lack of motivation..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="preferredActivities"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>What types of physical activities do you enjoy?</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Walking, swimming, yoga, gardening..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="healthConcerns"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Do you have any specific health concerns you'd like us to know about?</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Optional: Share any health concerns or conditions..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </Card>

          <Button type="submit" className="w-full">Continue</Button>
        </form>
      </Form>
    </div>
  );
}