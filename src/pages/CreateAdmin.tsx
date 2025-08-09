import CreateAdminUser from '@/components/CreateAdminUser';

const CreateAdmin = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <CreateAdminUser />
      </div>
    </div>
  );
};

export default CreateAdmin;