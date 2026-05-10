import axios from 'axios';
export const sendTranscript = async (transcript) => {
  const res = await axios.post('/api/chat', { transcript });
  return res.data;
};
