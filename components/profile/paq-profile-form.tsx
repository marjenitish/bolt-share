'use client';

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
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';

const paqSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  heartCondition: z.enum(['yes', 'no']),
  chestPain: z.enum(['yes', 'no']),
  dizziness: z.enum(['yes', 'no']),
  asthma: z.enum(['yes', 'no']),
  diabetes: z.enum(['yes', 'no']),
  muscleProblems: z.enum(['yes', 'no']),
  otherConditions: z.enum(['yes', 'no']),
  medicalClearance: z.enum(['yes', 'no']),
  consent: z.boolean().refine(val => val, 'You must agree to participate'),
});

interface PAQProfileFormProps {
  onSubmit: (data: z.infer<typeof paqSchema>) => void;
  defaultValues?: Partial<z.infer<typeof paqSchema>>;
  readOnly?: boolean;
}

export function PAQProfileForm({ onSubmit, defaultValues, readOnly = false }: PAQProfileFormProps) {
  const form = useForm<z.infer<typeof paqSchema>>({
    resolver: zodResolver(paqSchema),
    defaultValues: {
      fullName: defaultValues?.fullName || '',
      dateOfBirth: defaultValues?.dateOfBirth || '',
      heartCondition: defaultValues?.heartCondition || 'no',
      chestPain: defaultValues?.chestPain || 'no',
      dizziness: defaultValues?.dizziness || 'no',
      asthma: defaultValues?.asthma || 'no',
      diabetes: defaultValues?.diabetes || 'no',
      muscleProblems: defaultValues?.muscleProblems || 'no',
      otherConditions: defaultValues?.otherConditions || 'no',
      medicalClearance: defaultValues?.medicalClearance || 'no',
      consent: defaultValues?.consent || false,
    },
  });

  const questions = [
    {
      name: 'heartCondition' as const,
      label: 'Has your doctor ever told you that you have a heart condition or have you ever suffered a stroke?',
      description: 'Heart conditions include, but are not limited to: post myocardial infarction (heart attack), angina, coronary artery bypass, coronary angioplasty, heart failure, cardiomyopathy, heart transplant, pacemaker insertion, congenital heart disease, heart valve disease and peripheral artery disease',
    },
    {
      name: 'chestPain' as const,
      label: 'Do you ever experience unexplained pains in your chest at rest or during physical activity/exercise?',
      description: 'Any unexplained chest pain that feels like constriction, burning, knifelike pains and/or dull ache',
    },
    {
      name: 'dizziness' as const,
      label: 'Do you ever feel faint or have spells of dizziness during physical activity/exercise that causes you to lose balance?',
      description: 'Examples of dizziness may include, but are not limited to: lightheadedness or the feeling of nearly fainting, loss of balance or other sensations such as floating or swimming',
    },
    {
      name: 'asthma' as const,
      label: 'Have you had an asthma attack requiring immediate medical attention at any time over the last 12 months?',
      description: 'Medical attention refers to a medical practitioner or hospital visit following an asthma attack. It does not include the self administration of medications prescribed for asthma',
    },
    {
      name: 'diabetes' as const,
      label: 'If you have diabetes (type I or type II) have you had trouble controlling your blood glucose in the last 3 months?',
      description: 'Trouble controlling blood sugar refers to suffering from hyperglycaemia (high) or hypoglycaemia (low)',
    },
    {
      name: 'muscleProblems' as const,
      label: 'Do you have any diagnosed muscle, bone or joint problems that you have been told could be made worse by participating in physical activity/exercise?',
      description: 'Examples include, but not limited to: recent bone fracture/s, surgeries or injuries',
    },
    {
      name: 'otherConditions' as const,
      label: 'Do you have any other medical condition(s) or recent changes in your health status that may require special consideration for you to exercise?',
      description: 'Examples include, but not limited to: acute injury, epilepsy, transplants, cancer',
    },
    {
      name: 'medicalClearance' as const,
      label: 'Has Healthy Lifestyle asked you to provide a Medical Clearance since you last enrolled due to Leader or refund request?',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
        <p>
          This Pre-Activity Questionnaire (PAQ) helps us ensure your safety during exercise. 
          Please note that your detailed answers will be reviewed as part of your class enrollment process.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card className="p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={readOnly} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} disabled={readOnly} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </Card>

          <Card className="p-6">
            <div className="space-y-8">
              {questions.map((question) => (
                <FormField
                  key={question.name}
                  control={form.control}
                  name={question.name}
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>{question.label}</FormLabel>
                      {question.description && (
                        <p className="text-sm text-muted-foreground">{question.description}</p>
                      )}
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex space-x-4"
                          disabled={readOnly}
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
            </div>
          </Card>

          <Card className="p-6">
            <FormField
              control={form.control}
              name="consent"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={readOnly}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      I wish to enroll in the Healthy Lifestyle exercise classes and acknowledge that:
                    </FormLabel>
                    <ul className="text-sm text-muted-foreground list-disc pl-4 mt-2 space-y-1">
                      <li>I have completed this Pre-Exercise Questionnaire honestly and to the best of my knowledge</li>
                      <li>I will seek the advice of my medical Doctor, where indicated, regarding my suitability to participate in group-based exercise</li>
                      <li>I will inform the Exercise Leader should there be any change in my health status or medications which may affect my ability to participate</li>
                    </ul>
                  </div>
                </FormItem>
              )}
            />
          </Card>

          {!readOnly && (
            <Button type="submit" className="w-full">Submit PAQ Form</Button>
          )}
        </form>
      </Form>
    </div>
  );
}