const schema = {
  type: "object",
  properties: {
    title: { type: 'string' },
    description: { type: 'string' },
    price: { type: 'number' },
    count: { type: 'number' },
  },
  required: ['title', 'description', 'price', 'count']
};

export default schema;