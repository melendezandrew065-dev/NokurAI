/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Curated high-resolution academic illustrations and scientific diagrams
 * for subjects and subtopics.
 */

export const SUBJECT_COVER_IMAGES: Record<string, string> = {
  'Cognitive Science': 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=900&auto=format&fit=crop&q=80',
  'Neuroscience': 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=900&auto=format&fit=crop&q=80',
  'Computer Science': 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=900&auto=format&fit=crop&q=80',
  'Distributed Systems': 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=900&auto=format&fit=crop&q=80',
  'Biochemistry': 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=900&auto=format&fit=crop&q=80',
  'Biology': 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=900&auto=format&fit=crop&q=80',
  'Physics': 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=900&auto=format&fit=crop&q=80',
  'Chemistry': 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=900&auto=format&fit=crop&q=80',
  'Mathematics': 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=900&auto=format&fit=crop&q=80',
  'Economics': 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=900&auto=format&fit=crop&q=80',
  'History': 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=900&auto=format&fit=crop&q=80',
  'Medicine': 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=900&auto=format&fit=crop&q=80',
  'Psychology': 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=900&auto=format&fit=crop&q=80',
  'Default': 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=900&auto=format&fit=crop&q=80',
};

export const TOPIC_DIAGRAM_IMAGES: Record<string, string> = {
  // Neuroscience & Cognitive Science
  'synaptic plasticity': 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=800&auto=format&fit=crop&q=80',
  'nmda': 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=800&auto=format&fit=crop&q=80',
  'forgetting curve': 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&auto=format&fit=crop&q=80',
  'sm-2': 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80',
  'sleep': 'https://images.unsplash.com/photo-1511295742362-92c96b124e52?w=800&auto=format&fit=crop&q=80',
  'retrieval practice': 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&auto=format&fit=crop&q=80',

  // Computer Science & Distributed Systems
  'consensus': 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
  'raft': 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
  'quorum': 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&auto=format&fit=crop&q=80',
  'log matching': 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
  'network': 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&auto=format&fit=crop&q=80',

  // Biochemistry & Biology
  'respiration': 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=800&auto=format&fit=crop&q=80',
  'mitochondria': 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&auto=format&fit=crop&q=80',
  'atp': 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&auto=format&fit=crop&q=80',
  'dna': 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=800&auto=format&fit=crop&q=80',
};

/**
 * Returns a high-definition relevant cover image for any subject
 */
export function getSubjectCoverImage(subject: string): string {
  if (!subject) return SUBJECT_COVER_IMAGES['Default'];
  for (const [key, url] of Object.entries(SUBJECT_COVER_IMAGES)) {
    if (subject.toLowerCase().includes(key.toLowerCase())) {
      return url;
    }
  }
  return SUBJECT_COVER_IMAGES['Default'];
}

/**
 * Returns a diagram or concept illustration URL based on topic and subject
 */
export function getTopicIllustration(topic: string, subject?: string): string {
  const lowerTopic = (topic || '').toLowerCase();
  for (const [key, url] of Object.entries(TOPIC_DIAGRAM_IMAGES)) {
    if (lowerTopic.includes(key)) {
      return url;
    }
  }
  if (subject) {
    return getSubjectCoverImage(subject);
  }
  return SUBJECT_COVER_IMAGES['Default'];
}
