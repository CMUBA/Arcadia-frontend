import { FC, FormEvent, useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
// Internal assets
import Copy from "@/assets/icon/copy.svg";
import ExternalLink from "@/assets/icon/external-link.svg";
import Placeholder1 from "@/assets/placeholders/hero-1.png";
// Internal utils
import { truncateAddress } from "@/utils/truncateAddress";
import { clampNumber } from "@/utils/clampNumber";
import { formatDate } from "@/utils/formatDate";
import { aptosClient } from "@/utils/aptosClient";
// Internal components
import { Image } from "@/components/ui/image";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Socials } from "@/pages/Market/components/Socials";
// Internal constants
import { NETWORK } from "@/constants";
// Internal config
import { config } from "@/config";
// Internal enrty functions
import { mintNFT } from "@/entry-functions/mint_nft";

interface HeroSectionProps {
  collectionData: any;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ collectionData }) => {
  const queryClient = useQueryClient();
  const { account, signAndSubmitTransaction } = useWallet();
  const [nftCount, setNftCount] = useState(1);

  const { userMintBalance = 0, collection, totalMinted = 0, maxSupply = 1 } = collectionData ?? {};
  const mintUpTo = Math.min(userMintBalance, maxSupply - totalMinted);

  // Show a message if no collection data is available
  if (!collectionData || !collection) {
    return (
      <section className="hero-container px-4 max-w-screen-xl mx-auto w-full">
        <Card className="p-6">
          <p className="text-center text-gray-500">
            Collection data is not available
          </p>
        </Card>
      </section>
    );
  }

  const mintNft = async (e: FormEvent) => {
    e.preventDefault();
    if (!account || !collectionData?.isMintActive) return;
    if (!collection?.collection_id) return;

    try {
      const response = await signAndSubmitTransaction(
        mintNFT({ 
          collectionId: collection.collection_id, 
          amount: nftCount 
        })
      );
      
      await aptosClient().waitForTransaction({ transactionHash: response.hash });
      queryClient.invalidateQueries();
      setNftCount(1);
      toast.success('NFT minted successfully!');
    } catch (error) {
      console.error('Mint error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to mint NFT');
    }
  };

  return (
    <section className="hero-container flex flex-col md:flex-row gap-6 px-4 max-w-screen-xl mx-auto w-full">
      <a
        href={`https://explorer.aptoslabs.com/account/${collection?.collection_id}?network=${NETWORK}`}
        target="_blank"
        className="w-1/2 md:basis-2/5 relative group"
      >
        <Image
          src={collection?.cdn_asset_uris.cdn_image_uri ?? collection?.cdn_asset_uris.cdn_animation_uri ?? Placeholder1}
          rounded
          className="aspect-square object-cover self-center transition-opacity group-hover:opacity-90"
        />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded">
          <span className="text-white flex items-center gap-2">
            View on Explorer
            <Image src={ExternalLink} className="invert" />
          </span>
        </div>
      </a>

      <div className="basis-3/5 flex flex-col gap-4">
        <h1 className="title-md">{collection?.collection_name ?? config.defaultCollection?.name}</h1>
        <Socials />
        <p className="body-sm">{collection?.description ?? config.defaultCollection?.description}</p>

        <Card>
          <CardContent
            fullPadding
            className="flex flex-col md:flex-row gap-4 md:justify-between items-start md:items-center flex-wrap"
          >
            <form onSubmit={mintNft} className="flex flex-col md:flex-row gap-4 w-full md:basis-1/4">
              <Input
                type="number"
                disabled={!collectionData?.isMintActive}
                value={nftCount}
                onChange={(e) => setNftCount(parseInt(e.currentTarget.value, 10))}
              />
              <Button className="h-16 md:h-auto" type="submit" disabled={!collectionData?.isMintActive}>
                Mint
              </Button>
            </form>
            <div className="flex flex-col gap-2 w-full md:basis-1/3">
              <p className="label-sm">You can mint up to</p>
              <p className="body-md">{mintUpTo > 1 ? `${mintUpTo} NFTs` : `${mintUpTo} NFT`}</p>
            </div>
            <div className="flex flex-col gap-2 w-full md:basis-1/3">
              <p className="label-sm text-secondary-text">
                {clampNumber(totalMinted)} / {clampNumber(maxSupply)} Minted
              </p>
              <Progress value={(totalMinted / maxSupply) * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-x-2 items-center flex-wrap justify-between">
          <p className="whitespace-nowrap body-sm-semibold">Collection Address</p>

          <div className="flex gap-x-2">
            <AddressButton address={collection?.collection_id ?? ""} />
            <a
              className={buttonVariants({ variant: "link" })}
              target="_blank"
              href={`https://explorer.aptoslabs.com/account/${collection?.collection_id}?network=${NETWORK}`}
            >
              View on Explorer <Image src={ExternalLink} />
            </a>
          </div>
        </div>

        <div>
          {collectionData?.startDate && new Date() < collectionData.startDate && (
            <div className="flex gap-x-2 justify-between flex-wrap">
              <p className="body-sm-semibold">Minting starts</p>
              <p className="body-sm">{formatDate(collectionData.startDate)}</p>
            </div>
          )}

          {collectionData?.endDate && new Date() < collectionData.endDate && !collectionData.isMintInfinite && (
            <div className="flex gap-x-2 justify-between flex-wrap">
              <p className="body-sm-semibold">Minting ends</p>
              <p className="body-sm">{formatDate(collectionData.endDate)}</p>
            </div>
          )}

          {collectionData?.endDate && new Date() > collectionData.endDate && <p className="body-sm-semibold">Minting has ended</p>}
        </div>
      </div>
    </section>
  );
};

const AddressButton: FC<{ address: string }> = ({ address }) => {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    if (copied) return;
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  }

  return (
    <Button onClick={onCopy} className="whitespace-nowrap flex gap-1 px-0 py-0" variant="link">
      {copied ? (
        "Copied!"
      ) : (
        <>
          {truncateAddress(address)}
          <Image src={Copy} className="dark:invert" />
        </>
      )}
    </Button>
  );
};
