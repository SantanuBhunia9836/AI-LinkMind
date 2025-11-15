import Image from 'next/image';
import icon from '../../.idx/icon.png';

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="bg-black rounded-lg">
        <Image src={icon} alt="LinkSaver Logo" width={40} height={40}  /> 
      </div>
      <h1 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-red-500 via-orange-500 to-orange-600 bg-clip-text text-transparent font-heading tracking-tight whitespace-nowrap">
        LinkSaver
      </h1>
    </div>
  );
}
