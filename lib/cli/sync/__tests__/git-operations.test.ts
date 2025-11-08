// Mock child_process before importing the module
const mockExec = jest.fn();
jest.mock('child_process', () => ({
  exec: mockExec
}));

jest.mock('util', () => ({
  promisify: (fn: any) => fn
}));

import {
  ensureTemplateRemote,
  fetchTemplate,
  getCommitsBehind,
  cherryPickCommit,
  abortCherryPick,
  createRollbackTag,
  hasRemote
} from '../git-operations.js';

describe('git-operations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('hasRemote', () => {
    it('should return true when remote exists', async () => {
      mockExec.mockResolvedValue({
        stdout: 'origin\ntemplate\n',
        stderr: ''
      });

      const result = await hasRemote('template');
      expect(result).toBe(true);
    });

    it('should return false when remote does not exist', async () => {
      mockExec.mockResolvedValue({
        stdout: 'origin\n',
        stderr: ''
      });

      const result = await hasRemote('template');
      expect(result).toBe(false);
    });
  });

  describe('ensureTemplateRemote', () => {
    it('should add template remote if not exists', async () => {
      (execAsync as jest.Mock)
        .mockResolvedValueOnce({ stdout: 'origin\n', stderr: '' }) // hasRemote check
        .mockResolvedValueOnce({ stdout: '', stderr: '' }); // git remote add

      await ensureTemplateRemote('https://github.com/imehr/blog-cc.git');

      expect(execAsync).toHaveBeenCalledWith('git remote add template "https://github.com/imehr/blog-cc.git"');
    });

    it('should not add remote if already exists', async () => {
      (execAsync as jest.Mock).mockResolvedValue({
        stdout: 'origin\ntemplate\n',
        stderr: ''
      });

      await ensureTemplateRemote('https://github.com/imehr/blog-cc.git');

      expect(execAsync).toHaveBeenCalledTimes(1); // Only hasRemote call
    });
  });

  describe('createRollbackTag', () => {
    it('should create tag with timestamp', async () => {
      const mockDate = new Date('2025-11-08T15:30:22Z');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

      (execAsync as jest.Mock).mockResolvedValue({ stdout: '', stderr: '' });

      const tag = await createRollbackTag();

      expect(tag).toMatch(/^pre-sync-2025-11-08-\d{6}$/);
      expect(execAsync).toHaveBeenCalledWith(expect.stringContaining('git tag'));
    });
  });

  describe('cherryPickCommit', () => {
    it('should successfully cherry-pick commit', async () => {
      (execAsync as jest.Mock).mockResolvedValue({ stdout: '', stderr: '' });

      const result = await cherryPickCommit('abc123');

      expect(result.status).toBe('success');
      expect(result.commit).toBe('abc123');
      expect(execAsync).toHaveBeenCalledWith('git cherry-pick abc123');
    });

    it('should detect conflicts on cherry-pick failure', async () => {
      (execAsync as jest.Mock)
        .mockRejectedValueOnce(new Error('CONFLICT'))
        .mockResolvedValueOnce({ stdout: 'UU file.txt\n', stderr: '' });

      const result = await cherryPickCommit('abc123');

      expect(result.status).toBe('conflict');
      expect(result.conflicts).toContain('file.txt');
    });
  });
});
