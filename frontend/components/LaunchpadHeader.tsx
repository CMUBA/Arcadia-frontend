import { Link } from "react-router-dom";
import { FC } from "react";

import { WalletSelector } from "@/components/WalletSelector";
import { buttonVariants } from "@/components/ui/button";

interface LaunchpadHeaderProps {
  title: string;
}

export const LaunchpadHeader: FC<LaunchpadHeaderProps> = ({ title }) => {

  return (
    <div className="flex items-center justify-between py-2 px-4 mx-auto w-full max-w-screen-xl flex-wrap">
      <h2 className="display">{title}</h2>

      <div className="flex gap-2 items-center">
        <Link className={buttonVariants({ variant: "link" })} to={"/market"}>
          Market Page
        </Link>
        <Link className={buttonVariants({ variant: "link" })} to={"/my-collections"}>
            My Collections
          </Link>
          <Link className={buttonVariants({ variant: "link" })} to={"/create-collection"}>
            Create Collection
          </Link>

        <WalletSelector />
      </div>
    </div>
  );
};
