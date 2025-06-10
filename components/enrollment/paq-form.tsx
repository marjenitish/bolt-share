import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card } from '@/components/ui/card';
import { Upload } from 'lucide-react';

const formSchema = z.object({
  heartCondition: z.enum(['yes', 'no']),
  chestPain: z.enum(['yes', 'no']),
  lossOfConsciousness: z.enum(['yes', 'no']),
  boneJointProblem: z.enum(['yes', 'no']),
  bloodPressureMedication: z.enum(['yes', 'no']),
  otherConditions: z.string().optional(),
  doctorSignature: z.string().min(1, 'Doctor signature file is required'),
});

interface PAQFormProps {
  onSubmit: () => void;
}

export function PAQForm({ onSubmit }: PAQFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    // Handle form submission
    console.log(data);
    onSubmit();
  };

  const questions = [
    {
      name: 'heartCondition',
      label: 'Has your doctor ever said that you have a heart condition?',
    },
    {
      name: 'chestPain',
      label: 'Do you experience chest pain during physical activity?',
    },
    {
      name: 'lossOfConsciousness',
      label: 'Have you experienced loss of consciousness or loss of balance in the last 12 months?',
    },
    {
      name: 'boneJointProblem',
      label: 'Do you have a bone or joint problem that could be made worse by physical activity?',
    },
    {
      name: 'bloodPressureMedication',
      label: 'Are you currently taking prescribed medication for blood pressure or heart condition?',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Pre-Activity Questionnaire (PAQ)</h2>
        <p className="text-muted-foreground">
          Please complete this questionnaire to help us ensure your safety during exercise.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <Card className="p-6">
            {questions.map((question) => (
              <FormField
                key={question.name}
                control={form.control}
                name={question.name as any}
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>{question.label}</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex space-x-4"
                      >
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <RadioGroupItem value="yes" />
                          </FormControl>
                          <FormLabel className="font-normal">Yes</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <RadioGroupItem value="no" />
                          </FormControl>
                          <FormLabel className="font-normal">No</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}

            <FormField
              control={form.control}
              name="otherConditions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Other Medical Conditions</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Please list any other medical conditions or concerns..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Card>

          <div className="space-y-4">
            <FormField
              control={form.control}
              name="doctorSignature"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Doctor's Signature</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-4">
                      <Input
                        type="file"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            field.onChange(file.name);
                          }
                        }}
                      />
                      <Button type="button" variant="outline">
                        <Upload className="mr-2 h-4 w-4" />
                        Upload
                      </Button>
                    </div>
                  </FormControl>
                  <FormDescription>
                    Please upload the signed PAQ form from your doctor, physiotherapist, or health professional.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button type="submit" className="w-full">Continue</Button>
        </form>
      </Form>
    </div>
  );
}