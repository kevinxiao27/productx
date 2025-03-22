export const getData = (req, res) => {
  // Example data - in a real app, this would come from a database
  const data = {
    items: [
      { id: 1, name: "Item 1" },
      { id: 2, name: "Item 2" },
      { id: 3, name: "Item 3" }
    ]
  };

  res.json(data);
};

export const createItem = (req, res) => {
  // In a real app, you would save this to a database
  const newItem = req.body;

  // Just returning the received item for demonstration
  res.status(201).json({
    message: "Item created successfully",
    item: newItem
  });
};
