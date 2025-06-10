import { cn } from '@/lib/utils';

interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Logo({ className, ...props }: LogoProps) {
  return (
    <div className={cn("flex items-center", className)} {...props}>
      <img 
        src="https://share.org.au/wp-content/uploads/2019/09/share-smr-logo-crop-e1597991162150.png" 
        alt="SHARE Logo"
        className="h-8 w-auto"
      />
    </div>
  );
}