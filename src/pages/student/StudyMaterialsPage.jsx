import React, { useState, useEffect, useCallback } from 'react';
import { studyMaterialsApi } from '../../api/studyMaterialsApi';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import {
  FileText,
  Search,
  Download,
  Eye,
  ExternalLink,
  AlertCircle,
  FolderOpen,
  Video,
  FileCode,
  Paperclip,
} from 'lucide-react';

// YouTube Brand Logo Icon component
const YoutubeIcon = ({ size = 18, style = {}, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ flexShrink: 0, ...style }}
    {...props}
  >
    <path
      d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.016 3.016 0 0 0-2.122 2.136C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.55 9.376.55 9.377-.55a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"
      fill="#FF0000"
    />
    <path d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="#ffffff" />
  </svg>
);

export const StudyMaterialsPage = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [fileType, setFileType] = useState('');
  const [sort, setSort] = useState('-createdAt');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, limit: 10 });

  // Preview Modal state (supports previewing a specific file)
  const [previewFile, setPreviewFile] = useState(null);

  const fetchMaterials = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit: 10, status: 'active', sort };
      if (search.trim()) params.search = search.trim();
      if (category) params.category = category;
      if (fileType) params.fileType = fileType;

      const res = await studyMaterialsApi.getAllStudyMaterials(params);
      if (res.success) {
        setMaterials(res.data || []);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      }
    } catch (err) {
      setError(err.message || 'Unable to retrieve study materials.');
    } finally {
      setLoading(false);
    }
  }, [category, fileType, sort, page, search]);

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchMaterials();
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 KB';
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) return `${mb.toFixed(2)} MB`;
    const kb = bytes / 1024;
    return `${kb.toFixed(1)} KB`;
  };

  const getBadgeVariant = (type) => {
    switch (type) {
      case 'pdf':
        return 'danger';
      case 'image':
        return 'success';
      case 'video':
        return 'warning';
      case 'document':
        return 'info';
      default:
        return 'neutral';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Page Header */}
      <div>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', fontWeight: 800 }}>Course Study Materials</h1>
        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
          Access verified lecture notes, reference documents, and video lessons for your enrolled courses.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <form
          onSubmit={handleSearchSubmit}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          {/* Search Box */}
          <div style={{ flex: '1 1 240px', position: 'relative' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search by title, description or keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Category Filter */}
          <div style={{ flex: '1 1 150px', minWidth: '130px' }}>
            <select
              className="form-select"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Categories</option>
              <option value="Technical">Technical</option>
              <option value="Programming">Programming</option>
              <option value="Theory">Theory</option>
              <option value="Syllabus">Syllabus</option>
            </select>
          </div>

          {/* File Type Filter */}
          <div style={{ flex: '1 1 140px', minWidth: '120px' }}>
            <select
              className="form-select"
              value={fileType}
              onChange={(e) => {
                setFileType(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Formats</option>
              <option value="pdf">PDF Documents</option>
              <option value="image">Images</option>
              <option value="document">Office Docs</option>
              <option value="video">Videos</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Sort Selector */}
          <div style={{ flex: '1 1 160px', minWidth: '140px' }}>
            <select
              className="form-select"
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
            >
              <option value="-createdAt">Newest First</option>
              <option value="createdAt">Oldest First</option>
              <option value="title">Title (A-Z)</option>
              <option value="-title">Title (Z-A)</option>
              <option value="-fileSize">Size (Largest)</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary">
            <Search size={16} />
            <span>Search</span>
          </button>

          {(search || category || fileType || sort !== '-createdAt') && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setSearch('');
                setCategory('');
                setFileType('');
                setSort('-createdAt');
                setPage(1);
              }}
            >
              Reset
            </button>
          )}
        </form>
      </div>

      {/* Error state with retry */}
      {error && (
        <div className="alert alert-danger" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
          <button onClick={fetchMaterials} className="btn btn-secondary btn-sm">
            Retry
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <LoadingSpinner fullPage text="Fetching study materials..." />
      ) : materials.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Materials Grid */}
          <div className="grid grid-cols-2" style={{ alignItems: 'stretch' }}>
            {materials.map((item) => {
              const isYt = (url) => typeof url === 'string' && (url.includes('youtube.com') || url.includes('youtu.be'));
              const rawFiles = item.files && item.files.length > 0
                ? item.files
                : (item.fileUrl && !isYt(item.fileUrl) && item.fileType !== 'video'
                    ? [{ fileUrl: item.fileUrl, fileName: item.fileName || item.title, fileType: item.fileType, fileSize: item.fileSize }]
                    : []);

              // Filter out any video/youtube pseudo-files so they only appear under Video Lectures
              const files = rawFiles.filter(
                (f) => f && f.fileUrl && !isYt(f.fileUrl) && !(f.fileType === 'video' && (f.fileName || '').toLowerCase().includes('youtube'))
              );

              // Gather YouTube video links
              const youtubeLinks = (
                item.youtubeLinks && item.youtubeLinks.length > 0
                  ? item.youtubeLinks
                  : (item.youtubeLink ? [item.youtubeLink] : [])
              ).filter((link) => typeof link === 'string' && link.trim().length > 0);

              return (
                <div key={item._id} className="card card-hover" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <Badge variant="info">
                      {item.category || 'Course Note'}
                    </Badge>
                    {item.course?.name && (
                      <span style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                        {item.course.name} {item.course.code ? `(${item.course.code})` : ''}
                      </span>
                    )}
                  </div>

                  <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--text-primary)', fontWeight: 700 }}>
                    {item.title}
                  </h3>

                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: '1.6' }}>
                    {item.description || 'Verified academic study material uploaded by faculty.'}
                  </p>

                  <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    {/* Attached Documents List */}
                    {files.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                          <Paperclip size={14} />
                          <span>{files.length} {files.length === 1 ? 'Attached File' : 'Attached Files'}</span>
                        </div>

                        {files.map((file, fIdx) => {
                          const resolvedUrl = studyMaterialsApi.resolveFileUrl(file.fileUrl);
                          return (
                            <div
                              key={file._id || fIdx}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '0.6rem 0.75rem',
                                backgroundColor: 'var(--bg-secondary)',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--border-subtle)',
                                gap: '0.75rem',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 0 }}>
                                <FileText size={18} color="var(--primary)" />
                                <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                                  <span style={{ fontSize: '0.875rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {file.fileName || `Document ${fIdx + 1}`}
                                  </span>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.725rem', color: 'var(--text-secondary)' }}>
                                    <Badge variant={getBadgeVariant(file.fileType)}>
                                      {file.fileType?.toUpperCase() || 'PDF'}
                                    </Badge>
                                    <span>{formatFileSize(file.fileSize)}</span>
                                  </div>
                                </div>
                              </div>

                              <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                                {/* Document Preview: Redirects directly to the document */}
                                <a
                                  href={resolvedUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn btn-secondary btn-sm"
                                  title="Preview document in new tab"
                                  style={{ padding: '0.3rem 0.6rem' }}
                                  onClick={(e) => {
                                    if (resolvedUrl) {
                                      window.open(resolvedUrl, '_blank', 'noopener,noreferrer');
                                      e.preventDefault();
                                    }
                                  }}
                                >
                                  <Eye size={14} />
                                  <span>Preview</span>
                                </a>

                                <a
                                  href={resolvedUrl}
                                  download={file.fileName || 'download'}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn btn-primary btn-sm"
                                  title="Download file"
                                  style={{ padding: '0.3rem 0.6rem' }}
                                >
                                  <Download size={14} />
                                </a>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* YouTube Video Section with YouTube Icon on Left Side */}
                    {youtubeLinks.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                          <YoutubeIcon size={16} />
                          <span>{youtubeLinks.length} {youtubeLinks.length === 1 ? 'Video Lecture' : 'Video Lectures'}</span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                          {youtubeLinks.map((link, yIdx) => (
                            <a
                              key={yIdx}
                              href={link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-secondary btn-sm"
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '0.55rem 0.85rem',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--border-subtle)',
                                backgroundColor: 'var(--bg-secondary)',
                                textDecoration: 'none',
                                color: 'var(--text-primary)',
                                fontWeight: 500,
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                                <YoutubeIcon size={18} />
                                <span>
                                  Watch Video Lecture{' '}
                                  {youtubeLinks.length > 1 ? `#${yIdx + 1}` : ''}
                                </span>
                              </div>
                              <ExternalLink size={13} style={{ opacity: 0.7 }} />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {files.length === 0 && youtubeLinks.length === 0 && (
                      <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', textAlign: 'center', padding: '0.5rem' }}>
                        No attached files or video resources for this material.
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}>
              <button
                className="btn btn-secondary btn-sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </button>
              <span style={{ display: 'flex', alignItems: 'center', padding: '0 0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Page {page} of {pagination.totalPages}
              </span>
              <button
                className="btn btn-secondary btn-sm"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          )}
        </div>
      ) : (
        <EmptyState
          icon={FolderOpen}
          title="No study materials match your search"
          description="Try clearing your filters or check back later when new materials are uploaded."
          action={
            (search || category) && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setSearch('');
                  setCategory('');
                  setPage(1);
                }}
              >
                Clear Filters
              </button>
            )
          }
        />
      )}
    </div>
  );
};
