// Internal components
import { Card } from "@/components/ui/card";
// Internal utils
import { clampNumber } from "@/utils/clampNumber";
// Internal hooks
import { useGetCollectionData } from "@/hooks/useGetCollectionData";

interface StatsSectionProps {
  collectionData: any; // Replace 'any' with your actual data type
  collectionId: string;
}

export const StatsSection: React.FC<StatsSectionProps> = ({ collectionData, collectionId }) => {
  const { maxSupply = 0, totalMinted = 0 } = collectionData ?? {};

  return (
    <section className="stats-container px-4 max-w-screen-xl mx-auto w-full">
      <ul className="flex flex-col md:flex-row gap-6">
        {[
          { title: "Created NFTs", value: maxSupply },
          { title: "Total Minted", value: totalMinted },
        ].map(({ title, value }) => (
          <li className="basis-1/2" key={title + " " + value}>
            <Card className="py-2 px-4" shadow="md">
              <p className="label-sm">{title}</p>
              <p className="heading-sm">{clampNumber(value)}</p>
            </Card>
          </li>
        ))}
      </ul>
    </section>
  );
};
