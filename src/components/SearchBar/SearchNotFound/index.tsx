import React from 'react';

const SearchNotFound = ({
  text,
  isBackgroundWhite,
}: {
  text: string;
  isBackgroundWhite?: boolean;
}) => {
  return (
    <div
      className={`${
        isBackgroundWhite ? 'bg-white' : ''
      } w-full py-16 font-fontFamily text-main-font-color shadow-[0px_8px_32px_rgba(0,0,0,0.04)] rounded-3xl text-center`}
    >
      <div className="font-bold text-3xl mb-2">Search results</div>
      <span className="text-base">No results found for &#8220;{text}&#8221;</span>
    </div>
  );
};

export default SearchNotFound;
