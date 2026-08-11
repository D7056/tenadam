import Cards from "./Cards";

type BuyerCardsProps = {
  title: string;
  description: string;
  image: string;
};
function BuyerCards({ title, description, image }: BuyerCardsProps) {
  return (
    <>
      <Cards
        title={title}
        description={description}
        image={image}
        buttons={[{ text: "Buy Now", effects: () => {} }]}
      />
    </>
  );
}

export default BuyerCards;
