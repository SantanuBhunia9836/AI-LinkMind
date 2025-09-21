import Image from 'next/image';
import icon from '../../.idx/icon.png';

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="bg-black rounded-lg">
        <Image src={icon} alt="LinkSaver Logo" width={40} height={40}  /> 
      </div>
      <h1 className="text-2xl font-bold text-foreground font-heading tracking-tight">
      </h1>
    </div>
  );
}
