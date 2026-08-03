import React from 'react';
import KnowledgeBase from '../components/knowledge/KnowledgeBase';
import { useNavigate } from 'react-router-dom';

export const KnowledgeBasePage = () => {
  const navigate = useNavigate();
  return (
    <KnowledgeBase 
      onExit={() => navigate('/')}
      onAskBook={(book) => navigate('/chat', { state: { initialQuestion: `حدّثني عن كتاب "${book.title}" للمؤلف ${book.author}، وما أبرز موضوعاته؟` } })} 
    />
  );
};
