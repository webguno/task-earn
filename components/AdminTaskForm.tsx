import React, { useState, useEffect } from 'react';
import { Offer } from '../types';

interface AdminTaskFormProps {
  initialData?: Offer | null;
  onSubmit: (data: Omit<Offer, 'id' | 'created_at'>) => Promise<void>;
  onCancel: () => void;
}

const AdminTaskForm: React.FC<AdminTaskFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    link: '',
    video_link: '',
    icon_url: '',
    steps: '', // Text area: one per line
    terms: '', // Text area: one per line
    is_active: true
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        description: initialData.description || '',
        link: initialData.link || '',
        video_link: initialData.video_link || '',
        icon_url: initialData.icon_url || '',
        steps: initialData.steps ? initialData.steps.join('\n') : '',
        terms: initialData.terms ? initialData.terms.join('\n') : '',
        is_active: initialData.is_active
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const stepsArray = formData.steps.split('\n').map(s => s.trim()).filter(s => s !== '');
    const termsArray = formData.terms.split('\n').map(t => t.trim()).filter(t => t !== '');

    // Sanitize inputs
    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      link: formData.link.trim(),
      // Send null if empty to keep DB clean, helps with some validation scenarios
      video_link: formData.video_link.trim() || undefined,
      icon_url: formData.icon_url.trim(),
      steps: stepsArray,
      terms: termsArray,
      is_active: formData.is_active
    };

    try {
      await onSubmit(payload as any); // Cast to allow optional properties if strict types complain
    } catch (error: any) {
      console.error("Error submitting form", error);
      // Fix: Display actual error message instead of [object Object]
      alert(`Failed to save task: ${error.message || 'Unknown error occurred'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
      <h2 className="text-xl font-bold mb-6 text-gray-800">{initialData ? 'Edit Task' : 'Create New Task'}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input 
              type="text" 
              required 
              value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Icon URL</label>
            <input 
              type="url" 
              placeholder="https://..."
              value={formData.icon_url} 
              onChange={e => setFormData({...formData, icon_url: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea 
            rows={2}
            value={formData.description} 
            onChange={e => setFormData({...formData, description: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
            <label className="block text-sm font-medium text-gray-700">Destination Link</label>
            <input 
                type="url" 
                placeholder="https://..."
                required
                value={formData.link} 
                onChange={e => setFormData({...formData, link: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2"
            />
            </div>
            <div>
            <label className="block text-sm font-medium text-gray-700">Guide Video URL (Optional)</label>
            <input 
                type="url" 
                placeholder="YouTube URL or Direct MP4 Link"
                value={formData.video_link} 
                onChange={e => setFormData({...formData, video_link: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2"
            />
            <p className="text-xs text-gray-500 mt-1">Paste a YouTube link OR a direct .mp4 link (e.g. from Supabase Storage)</p>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Steps (One per line)</label>
            <textarea 
              rows={4}
              placeholder="Download App&#10;Register&#10;Reach Level 5"
              value={formData.steps} 
              onChange={e => setFormData({...formData, steps: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2"
            />
          </div>
          <div>
             <label className="block text-sm font-medium text-gray-700">Terms (One per line)</label>
            <textarea 
              rows={4}
              placeholder="New users only&#10;US residents only"
              value={formData.terms} 
              onChange={e => setFormData({...formData, terms: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2"
            />
          </div>
        </div>

        <div className="flex items-center">
          <input
            id="is_active"
            type="checkbox"
            checked={formData.is_active}
            onChange={e => setFormData({...formData, is_active: e.target.checked})}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
            Active (Visible to users)
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-4">
           <button
             type="button"
             onClick={onCancel}
             className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
           >
             Cancel
           </button>
           <button
             type="submit"
             disabled={loading}
             className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
           >
             {loading ? 'Saving...' : 'Save Task'}
           </button>
        </div>
      </form>
    </div>
  );
};

export default AdminTaskForm;